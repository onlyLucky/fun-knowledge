import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as fs from 'fs';
import * as path from 'path';
import { ConfigService } from '@nestjs/config';
import { Knowledge } from '../knowledge/entities/knowledge.entity';
import { SystemManageType } from '../../common/enums/system-manage-type.enum';
import type { SystemDataDto } from './dto/system-data.dto';
import type { StorageStatsData, CleanResultData, StorageTypeStats, UnusedResourceItem } from './dto/storage.dto';

/** 资源类型子目录名 */
const RESOURCE_TYPE_DIRS = ['image', 'video', 'audio', 'model_3d', 'other'] as const;

@Injectable()
export class SystemService {
  private readonly logger = new Logger(SystemService.name);

  private handlers: Record<string, (params?: Record<string, unknown>) => Promise<unknown>>;

  constructor(
    @InjectRepository(Knowledge)
    private readonly knowledgeRepo: Repository<Knowledge>,
    private readonly configService: ConfigService,
  ) {
    this.handlers = {
      [SystemManageType.STORAGE_STATS]: () => this.getStorageStats(),
      [SystemManageType.STORAGE_CLEAN]: () => this.cleanUnusedResources(),
    };
  }

  async getAllData(): Promise<SystemDataDto> {
    const storageStats = await this.getStorageStats();

    return {
      groups: [
        {
          key: 'storage',
          label: '存储管理',
          items: [
            { type: SystemManageType.STORAGE_STATS, label: '知识卡片存储', data: storageStats },
          ],
        },
      ],
    };
  }

  async executeAction(type: SystemManageType, params?: Record<string, unknown>): Promise<unknown> {
    const handler = this.handlers[type];
    if (!handler) {
      throw new BadRequestException(`未知的系统管理操作: ${type}`);
    }
    return handler(params);
  }

  private async getStorageStats(): Promise<StorageStatsData> {
    const baseDir = this.configService.get<string>('storage.localPath', './uploads');
    const knowledgeDir = path.join(baseDir, 'knowledge');

    // 获取数据库中所有被引用的 resource_url
    const referencedUrls = await this.getReferencedUrls();
    const referencedPaths = new Set(
      referencedUrls
        .filter((url) => url && url.startsWith('/uploads/knowledge/'))
        .map((url) => {
          // 提取相对路径：/uploads/knowledge/image/xxx.png → knowledge/image/xxx.png
          return url.replace('/uploads/', '');
        }),
    );

    // 扫描 knowledge 目录
    const allFiles = this.scanDirectory(knowledgeDir, 'knowledge');

    // 按类型分组统计
    const typeMap = new Map<string, StorageTypeStats>();
    for (const dir of RESOURCE_TYPE_DIRS) {
      typeMap.set(dir, { type: dir, count: 0, size: 0 });
    }

    let usedFiles = 0;
    let usedSize = 0;
    let unusedFiles = 0;
    let unusedSize = 0;
    const unusedItems: UnusedResourceItem[] = [];

    for (const file of allFiles) {
      // 判断资源类型（从路径中提取，如 knowledge/image/xxx.png → image）
      const parts = file.relativePath.split('/');
      const resourceType = parts.length >= 2 ? parts[1] : 'other';
      const stats = typeMap.get(resourceType) || typeMap.get('other')!;
      stats.count++;
      stats.size += file.size;

      if (referencedPaths.has(file.relativePath)) {
        usedFiles++;
        usedSize += file.size;
      } else {
        unusedFiles++;
        unusedSize += file.size;
        unusedItems.push({
          path: `/uploads/${file.relativePath}`,
          filename: file.filename,
          size: file.size,
          modified_at: file.modifiedAt,
        });
      }
    }

    return {
      total_files: allFiles.length,
      total_size: allFiles.reduce((sum, f) => sum + f.size, 0),
      used_files: usedFiles,
      used_size: usedSize,
      unused_files: unusedFiles,
      unused_size: unusedSize,
      types: Array.from(typeMap.values()).filter((t) => t.count > 0),
      unused_items: unusedItems,
    };
  }

  private async cleanUnusedResources(): Promise<CleanResultData> {
    const stats = await this.getStorageStats();
    let deletedCount = 0;
    let freedSize = 0;

    const baseDir = this.configService.get<string>('storage.localPath', './uploads');

    for (const item of stats.unused_items) {
      try {
        const filePath = path.join(baseDir, item.path.replace('/uploads/', ''));
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
          deletedCount++;
          freedSize += item.size;
        }
      } catch (err) {
        this.logger.warn(`删除文件失败: ${item.path}`, err);
      }
    }

    // 清理空目录
    this.removeEmptyDirs(path.join(baseDir, 'knowledge'));

    this.logger.log(`清理完成: 删除 ${deletedCount} 个文件，释放 ${freedSize} 字节`);
    return { deleted_count: deletedCount, freed_size: freedSize };
  }

  /** 删除单个未使用资源 */
  async deleteSingleResource(resourcePath: string): Promise<{ success: boolean }> {
    if (!resourcePath || !resourcePath.startsWith('/uploads/knowledge/')) {
      throw new BadRequestException('无效的资源路径');
    }

    // 确认该资源未被引用
    const referencedUrls = await this.getReferencedUrls();
    const referencedPaths = new Set(
      referencedUrls
        .filter((url) => url && url.startsWith('/uploads/knowledge/'))
        .map((url) => url.replace('/uploads/', '')),
    );

    const relativePath = resourcePath.replace('/uploads/', '');
    if (referencedPaths.has(relativePath)) {
      throw new BadRequestException('该资源正在被使用，无法删除');
    }

    const baseDir = this.configService.get<string>('storage.localPath', './uploads');
    const filePath = path.join(baseDir, relativePath);

    if (!fs.existsSync(filePath)) {
      throw new BadRequestException('资源文件不存在');
    }

    fs.unlinkSync(filePath);

    // 清理空目录
    const dir = path.dirname(filePath);
    this.removeEmptyDirs(path.join(baseDir, 'knowledge'));

    this.logger.log(`已删除单个资源: ${resourcePath}`);
    return { success: true };
  }

  /** 获取数据库中所有被引用的 resource_url */
  private async getReferencedUrls(): Promise<string[]> {
    const results = await this.knowledgeRepo
      .createQueryBuilder('k')
      .select('k.resource_url')
      .where('k.resource_url IS NOT NULL AND k.resource_url != :empty', { empty: '' })
      .getMany();
    return results.map((k) => k.resource_url);
  }

  /** 递归扫描目录，返回文件列表 */
  private scanDirectory(
    dir: string,
    basePrefix: string,
  ): Array<{ relativePath: string; filename: string; size: number; modifiedAt: Date }> {
    const files: Array<{ relativePath: string; filename: string; size: number; modifiedAt: Date }> = [];

    if (!fs.existsSync(dir)) return files;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        files.push(...this.scanDirectory(fullPath, `${basePrefix}/${entry.name}`));
      } else if (entry.isFile()) {
        const stat = fs.statSync(fullPath);
        files.push({
          relativePath: `${basePrefix}/${entry.name}`,
          filename: entry.name,
          size: stat.size,
          modifiedAt: stat.mtime,
        });
      }
    }

    return files;
  }

  /** 递归删除空目录 */
  private removeEmptyDirs(dir: string): void {
    if (!fs.existsSync(dir)) return;

    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const subDir = path.join(dir, entry.name);
        this.removeEmptyDirs(subDir);
        // 如果子目录为空，删除它
        try {
          const remaining = fs.readdirSync(subDir);
          if (remaining.length === 0) {
            fs.rmdirSync(subDir);
          }
        } catch {
          // ignore
        }
      }
    }
  }
}
