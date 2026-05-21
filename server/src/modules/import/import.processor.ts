import {
  Processor,
  Process,
  OnQueueCompleted,
  OnQueueFailed,
} from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Job } from 'bull';
import * as path from 'path';
import { ImportTask } from './entities/import-task.entity';
import { Knowledge } from '../knowledge/entities/knowledge.entity';
import { Category } from '../category/entities/category.entity';
import { UploadService } from '../upload/upload.service';
import { UploadType } from '../upload/dto/upload.dto';
import { ImportStatus } from '../../common/enums/status.enum';
import { AiExtendType } from '../../common/enums/ai-extend-type.enum';
import type { ImportJobData, ExcelRow } from './import.service';

/** 扩展名 → resource_type 映射 */
const EXT_TO_RESOURCE_TYPE: Record<string, string> = {
  '.jpg': 'image', '.jpeg': 'image', '.png': 'image',
  '.gif': 'image', '.webp': 'image', '.svg': 'image',
  '.mp4': 'video', '.webm': 'video', '.mov': 'video',
  '.mp3': 'audio', '.wav': 'audio', '.ogg': 'audio',
  '.glb': 'model_3d', '.gltf': 'model_3d',
};

/**
 * 导入任务队列处理器
 */
@Processor('knowledge-import')
export class ImportProcessor {
  private readonly logger = new Logger(ImportProcessor.name);

  constructor(
    @InjectRepository(ImportTask)
    private readonly importTaskRepo: Repository<ImportTask>,
    @InjectRepository(Knowledge)
    private readonly knowledgeRepo: Repository<Knowledge>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    private readonly uploadService: UploadService,
  ) {}

  /**
   * 处理导入任务
   */
  @Process('import')
  async handleImport(job: Job<ImportJobData>): Promise<void> {
    const { taskId, rows, resourceMap } = job.data;
    this.logger.log(`开始处理导入任务: ${taskId}，共 ${rows.length} 条`);

    const task = await this.importTaskRepo.findOne({ where: { id: taskId } });
    if (!task) {
      this.logger.error(`导入任务不存在: ${taskId}`);
      return;
    }

    // 预加载所有相关类目，按名称索引
    const categories = await this.categoryRepo.find();
    const categoryMap = new Map(categories.map((c) => [c.name, c]));

    let successCount = 0;
    let failCount = 0;
    const errorLogs: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      try {
        const category = categoryMap.get(row.category_name);
        if (!category) {
          throw new Error(`类目不存在: ${row.category_name}`);
        }

        // 查重：同一类目下标题不能重复
        const existing = await this.knowledgeRepo.findOne({
          where: { title: row.title, category_id: category.id },
        });
        if (existing) {
          throw new Error('该类目下已存在相同标题的知识卡片');
        }

        // 解析标签
        const tags = row.tags
          ? row.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [];

        // 处理资源
        let resourceUrl = '';
        let resourceType = row.resource_type || '';

        if (row.resource_url) {
          if (row.resource_url.startsWith('http://') || row.resource_url.startsWith('https://')) {
            // 在线 URL：直接使用
            resourceUrl = row.resource_url;
            if (!resourceType) {
              resourceType = 'webpage';
            }
          } else if (resourceMap && resourceMap[row.resource_url]) {
            // ZIP 内文件：上传到存储（Bull 序列化会将 Buffer 变为普通对象，需转回）
            const raw = resourceMap[row.resource_url];
            const buffer = Buffer.isBuffer(raw) ? raw : Buffer.from(raw);
            const ext = path.extname(row.resource_url).toLowerCase();
            const mimeMap: Record<string, string> = {
              '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png',
              '.gif': 'image/gif', '.webp': 'image/webp',
              '.mp4': 'video/mp4', '.mp3': 'audio/mpeg', '.wav': 'audio/wav',
              '.glb': 'model/gltf-binary', '.gltf': 'model/gltf+json',
            };
            const fakeFile: Express.Multer.File = {
              buffer,
              originalname: row.resource_url,
              mimetype: mimeMap[ext] || 'application/octet-stream',
              size: buffer.length,
              fieldname: 'file',
              encoding: '7bit',
              destination: '',
              filename: row.resource_url,
              path: '',
              stream: null as any,
            };
            const result = await this.uploadService.upload(fakeFile, UploadType.KNOWLEDGE);
            resourceUrl = result.url;
            if (!resourceType && result.resource_type) {
              resourceType = result.resource_type;
            }
          } else {
            // 文件名在 ZIP 中不存在
            throw new Error(`资源文件不存在: ${row.resource_url}`);
          }
        }

        // 自动推断 resource_type
        if (!resourceType && resourceUrl) {
          const ext = path.extname(resourceUrl).toLowerCase();
          resourceType = EXT_TO_RESOURCE_TYPE[ext] || 'webpage';
        }

        const knowledge = new Knowledge();
        knowledge.title = row.title;
        knowledge.content = row.content;
        knowledge.resource_url = resourceUrl;
        knowledge.resource_type = resourceType;
        knowledge.category_id = category.id;
        knowledge.tags = tags;
        knowledge.source = row.source || '';
        knowledge.created_by = row.admin_id;
        knowledge.updated_by = row.admin_id;
        knowledge.status = row.status ?? 1;

        // AI 延伸解读配置
        if (row.ai_extend_type && Object.values(AiExtendType).includes(row.ai_extend_type as AiExtendType)) {
          knowledge.ai_extend_type = row.ai_extend_type;
        }
        if (row.ai_extend_data) {
          const parsed = JSON.parse(row.ai_extend_data);
          if (!Array.isArray(parsed)) {
            throw new Error('AI延伸解读数据必须为数组');
          }
          for (const item of parsed) {
            if (!item || typeof item !== 'object' || typeof item.title !== 'string' || typeof item.content !== 'string') {
              throw new Error('AI延伸解读数据格式不正确，每项需包含 title 和 content 字段');
            }
          }
          knowledge.ai_extend_data = parsed;
        }

        await this.knowledgeRepo.save(knowledge);
        successCount++;
      } catch (error) {
        failCount++;
        const errMsg = `第 ${i + 1} 行: ${error.message}`;
        errorLogs.push(errMsg);
        this.logger.warn(`导入行失败 - ${errMsg}`);
      }

      // 更新进度
      task.success_count = successCount;
      task.fail_count = failCount;
      await this.importTaskRepo.save(task);
    }

    // 更新最终状态
    task.status = failCount === rows.length ? ImportStatus.FAILED : ImportStatus.SUCCESS;
    task.error_log = errorLogs.length > 0 ? errorLogs.join('\n') : '';
    task.completed_at = new Date();
    await this.importTaskRepo.save(task);

    this.logger.log(
      `导入任务 ${taskId} 完成: 成功 ${successCount}，失败 ${failCount}`,
    );
  }

  @OnQueueCompleted()
  onCompleted(job: Job<ImportJobData>) {
    this.logger.log(`导入任务 Job 完成: ${job.data.taskId}`);
  }

  @OnQueueFailed()
  onFailed(job: Job<ImportJobData>, error: Error) {
    this.logger.error(`导入任务 Job 失败: ${job.data.taskId}`, error.stack);
  }
}
