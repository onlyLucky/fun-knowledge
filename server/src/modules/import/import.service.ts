import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as XLSX from 'xlsx';
import * as AdmZip from 'adm-zip';
import * as path from 'path';
import { ImportTask } from './entities/import-task.entity';
import { ImportStatus } from '../../common/enums/status.enum';
import { ConfigService as AppConfigService } from '../config/config.service';

/** Excel 行数据接口 */
export interface ExcelRow {
  title: string;
  content: string;
  status?: number;
  resource_type?: string;
  resource_url?: string;
  category_name: string;
  tags?: string;
  source?: string;
  ai_extend_type?: string;
  ai_extend_data?: string;
}

/** Bull 队列 Job 数据 */
export interface ImportJobData {
  taskId: string;
  rows: Array<ExcelRow & { admin_id: string }>;
  resourceMap?: Record<string, Buffer>;
}

/** 可执行/脚本文件扩展名黑名单 */
const DANGEROUS_EXTENSIONS = new Set([
  '.php', '.asp', '.aspx', '.jsp', '.jspx',
  '.sh', '.bash', '.bat', '.cmd', '.ps1',
  '.exe', '.dll', '.so', '.dylib',
  '.js', '.mjs', '.cjs',
  '.html', '.htm', '.xhtml',
  '.svg', '.xml',
]);

/** ZIP 安全常量 */
const MAX_SINGLE_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_TOTAL_EXTRACT_SIZE = 200 * 1024 * 1024; // 200MB
const DEFAULT_MAX_RESOURCES = 500;
const DEFAULT_MAX_ZIP_SIZE = 50 * 1024 * 1024; // 50MB

/**
 * 导入服务
 */
@Injectable()
export class ImportService {
  private readonly logger = new Logger(ImportService.name);

  constructor(
    @InjectRepository(ImportTask)
    private readonly importTaskRepo: Repository<ImportTask>,
    @InjectQueue('knowledge-import')
    private readonly importQueue: Queue,
    private readonly appConfigService: AppConfigService,
  ) {}

  /**
   * 启动批量导入（ZIP 压缩包）
   */
  async startImport(adminId: string, file: Express.Multer.File): Promise<ImportTask> {
    // 读取系统配置
    const maxZipSize = await this.getConfigNumber('import_max_zip_size', DEFAULT_MAX_ZIP_SIZE);
    const maxResources = await this.getConfigNumber('import_max_resources', DEFAULT_MAX_RESOURCES);

    // 1. ZIP 大小校验
    if (file.size > maxZipSize) {
      throw new BadRequestException(`ZIP 文件大小不能超过 ${Math.round(maxZipSize / 1024 / 1024)}MB`);
    }

    // 2. 解析 ZIP
    let zip: AdmZip;
    try {
      zip = new AdmZip(file.buffer);
    } catch {
      throw new BadRequestException('无法解析 ZIP 文件，请确认文件格式正确');
    }

    const entries = zip.getEntries();

    // 3. 安全校验
    let totalExtractSize = 0;
    let resourceCount = 0;
    const resourceMap: Record<string, Buffer> = {};
    let xlsxEntry: AdmZip.IZipEntry | null = null;

    for (const entry of entries) {
      // 跳过目录和 macOS 元数据文件
      if (entry.isDirectory) continue;
      if (entry.entryName.startsWith('__MACOSX/') || path.basename(entry.entryName).startsWith('._')) continue;

      // 路径穿越检查
      if (entry.entryName.includes('..') || /^[A-Za-z]:\\/.test(entry.entryName) || entry.entryName.startsWith('/')) {
        throw new BadRequestException(`ZIP 内存在不安全的路径: ${entry.entryName}`);
      }

      // 扩展名黑名单
      const ext = path.extname(entry.entryName).toLowerCase();
      if (DANGEROUS_EXTENSIONS.has(ext)) {
        throw new BadRequestException(`ZIP 内包含不允许的文件类型: ${entry.entryName}`);
      }

      // 单文件大小限制
      if (entry.header.size > MAX_SINGLE_FILE_SIZE) {
        throw new BadRequestException(`文件 ${entry.entryName} 大小超过 10MB 限制`);
      }

      // 累计解压大小
      totalExtractSize += entry.header.size;
      if (totalExtractSize > MAX_TOTAL_EXTRACT_SIZE) {
        throw new BadRequestException('ZIP 解压后总大小超过 200MB 限制');
      }

      // 文件数量限制
      const extLower = ext.toLowerCase();
      if (extLower === '.xlsx') {
        if (xlsxEntry) {
          throw new BadRequestException('ZIP 内只能包含一个 .xlsx 文件');
        }
        xlsxEntry = entry;
      } else {
        resourceCount++;
        if (resourceCount > maxResources) {
          throw new BadRequestException(`资源文件数量超过 ${maxResources} 个限制`);
        }
        // 用 basename 作为 key，方便 Excel 中按文件名引用
        const basename = path.basename(entry.entryName);
        resourceMap[basename] = entry.getData();
      }
    }

    if (!xlsxEntry) {
      throw new BadRequestException('ZIP 内未找到 .xlsx 文件');
    }

    // 4. 解析 Excel
    const workbook = XLSX.read(xlsxEntry.getData(), { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rawRows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(worksheet);

    if (rawRows.length === 0) {
      throw new BadRequestException('Excel 文件为空');
    }

    // 5. 解析并清洗行数据
    const rows: ExcelRow[] = rawRows.map((raw, idx) => this.parseRow(raw, idx + 2));

    // 6. 创建导入任务记录
    const task = this.importTaskRepo.create({
      admin_id: adminId,
      file_url: file.originalname,
      total_count: rows.length,
      success_count: 0,
      fail_count: 0,
      status: ImportStatus.PROCESSING,
    });
    await this.importTaskRepo.save(task);

    // 7. 推入队列（含资源文件 Map）
    const importRows = rows.map((row) => ({ ...row, admin_id: adminId }));
    const jobData: ImportJobData = {
      taskId: task.id,
      rows: importRows,
      resourceMap: Object.keys(resourceMap).length > 0 ? resourceMap : undefined,
    };
    await this.importQueue.add('import', jobData);

    this.logger.log(`导入任务已创建: ${task.id}，共 ${rows.length} 条数据，${resourceCount} 个资源文件`);
    return task;
  }

  /**
   * 解析并清洗单行数据
   */
  private parseRow(raw: Record<string, unknown>, rowNum: number): ExcelRow {
    const title = this.sanitizeText(String(raw['标题'] || ''), 200);
    const content = this.sanitizeText(String(raw['内容'] || ''));

    if (!title) {
      throw new BadRequestException(`第 ${rowNum} 行：标题不能为空`);
    }
    if (!content) {
      throw new BadRequestException(`第 ${rowNum} 行：内容不能为空`);
    }

    const categoryName = this.sanitizeText(String(raw['类目名称'] || ''), 50);
    if (!categoryName) {
      throw new BadRequestException(`第 ${rowNum} 行：类目名称不能为空`);
    }

    // 状态：0 或 1
    let status: number | undefined;
    const rawStatus = raw['状态'];
    if (rawStatus !== undefined && rawStatus !== '') {
      status = Number(rawStatus);
      if (status !== 0 && status !== 1) {
        throw new BadRequestException(`第 ${rowNum} 行：状态必须为 0 或 1`);
      }
    }

    // 资源类型
    const VALID_RESOURCE_TYPES = ['image', 'video', 'audio', 'model_3d', 'svg', 'webpage'];
    let resourceType: string | undefined;
    const rawResourceType = raw['资源类型'] ? this.sanitizeText(String(raw['资源类型']), 20) : '';
    if (rawResourceType) {
      if (!VALID_RESOURCE_TYPES.includes(rawResourceType)) {
        throw new BadRequestException(
          `第 ${rowNum} 行：资源类型不合法，允许值: ${VALID_RESOURCE_TYPES.join(', ')}`,
        );
      }
      resourceType = rawResourceType;
    }

    // 资源 URL：文件名或 http/https 在线地址
    let resourceUrl: string | undefined;
    const rawUrl = raw['资源URL'] ? String(raw['资源URL']).trim() : '';
    if (rawUrl) {
      if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
        resourceUrl = this.sanitizeUrl(rawUrl);
      } else {
        // 文件名：仅允许安全字符
        const basename = path.basename(rawUrl);
        if (basename.includes('..') || DANGEROUS_EXTENSIONS.has(path.extname(basename).toLowerCase())) {
          throw new BadRequestException(`第 ${rowNum} 行：资源文件名不安全`);
        }
        resourceUrl = basename;
      }
    }

    const tags = raw['标签（逗号分隔）'] ? this.sanitizeText(String(raw['标签（逗号分隔）']), 500) : undefined;
    const source = raw['来源'] ? this.sanitizeText(String(raw['来源']), 200) : undefined;

    // AI 延伸解读方式
    let aiExtendType: string | undefined;
    const rawAiExtendType = raw['AI延伸解读方式'] ? this.sanitizeText(String(raw['AI延伸解读方式']), 20) : '';
    if (rawAiExtendType) {
      if (rawAiExtendType !== 'ai_model' && rawAiExtendType !== 'static_data') {
        throw new BadRequestException(`第 ${rowNum} 行：AI延伸解读方式必须为 ai_model 或 static_data`);
      }
      aiExtendType = rawAiExtendType;
    }

    // AI 延伸解读数据（JSON 字符串）
    let aiExtendData: string | undefined;
    const rawAiExtendData = raw['AI延伸解读数据'] ? String(raw['AI延伸解读数据']).trim() : '';
    if (rawAiExtendData) {
      let parsed: unknown;
      try {
        parsed = JSON.parse(rawAiExtendData);
      } catch {
        throw new BadRequestException(
          `第 ${rowNum} 行：AI延伸解读数据 JSON 解析失败，需为 [{"title":"...","content":"...","source":"..."}] 格式的数组`,
        );
      }
      if (!Array.isArray(parsed)) {
        throw new BadRequestException(
          `第 ${rowNum} 行：AI延伸解读数据必须为数组，收到: ${typeof parsed}`,
        );
      }
      for (let j = 0; j < parsed.length; j++) {
        const item = parsed[j];
        if (!item || typeof item !== 'object') {
          throw new BadRequestException(
            `第 ${rowNum} 行：AI延伸解读数据第 ${j + 1} 项不是对象`,
          );
        }
        if (typeof item.title !== 'string' || !item.title.trim()) {
          throw new BadRequestException(
            `第 ${rowNum} 行：AI延伸解读数据第 ${j + 1} 项缺少 title 字段（字符串）`,
          );
        }
        if (typeof item.content !== 'string' || !item.content.trim()) {
          throw new BadRequestException(
            `第 ${rowNum} 行：AI延伸解读数据第 ${j + 1} 项缺少 content 字段（字符串）`,
          );
        }
        if (item.source !== undefined && typeof item.source !== 'string') {
          throw new BadRequestException(
            `第 ${rowNum} 行：AI延伸解读数据第 ${j + 1} 项 source 字段必须为字符串`,
          );
        }
      }
      aiExtendData = rawAiExtendData;
    }

    return {
      title,
      content,
      status,
      resource_type: resourceType,
      resource_url: resourceUrl,
      category_name: categoryName,
      tags,
      source,
      ai_extend_type: aiExtendType,
      ai_extend_data: aiExtendData,
    };
  }

  /**
   * 清洗文本内容 — 防 XSS
   */
  private sanitizeText(text: string, maxLength?: number): string {
    let cleaned = text
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '') // 移除 script 标签
      .replace(/javascript:/gi, '') // 移除 javascript: 协议
      .replace(/on\w+\s*=/gi, '') // 移除事件处理器
      .trim();

    if (maxLength && cleaned.length > maxLength) {
      cleaned = cleaned.substring(0, maxLength);
    }
    return cleaned;
  }

  /**
   * 清洗 URL — 仅允许 http/https
   */
  private sanitizeUrl(url: string): string {
    const cleaned = url.trim();
    if (!/^https?:\/\//i.test(cleaned)) {
      throw new BadRequestException('在线资源 URL 必须以 http:// 或 https:// 开头');
    }
    // 长度限制
    if (cleaned.length > 500) {
      throw new BadRequestException('资源 URL 长度不能超过 500');
    }
    return cleaned;
  }

  /**
   * 读取系统配置（数字类型）
   */
  private async getConfigNumber(key: string, defaultValue: number): Promise<number> {
    try {
      const config = await this.appConfigService.findByKey(key);
      return Number(config.config_value) || defaultValue;
    } catch {
      return defaultValue;
    }
  }

  /**
   * 生成导入模板（ZIP 格式）
   */
  getTemplate(): Buffer {
    const headers = ['标题', '内容', '状态', '资源类型', '资源URL', '类目名称', '标签（逗号分隔）', '来源', 'AI延伸解读方式', 'AI延伸解读数据'];
    const exampleRow = [
      '太阳为什么是圆的',
      '引力使物质均匀分布...',
      '1',
      'image',
      'sun.jpg',
      '科学',
      '天文,物理',
      '维基百科',
      'ai_model',
      '[{"title":"延伸知识1","content":"这是延伸解读内容","source":"参考来源"}]',
    ];

    const worksheet = XLSX.utils.aoa_to_sheet([headers, exampleRow]);
    worksheet['!cols'] = [
      { wch: 30 }, // 标题
      { wch: 60 }, // 内容
      { wch: 8 },  // 状态
      { wch: 12 }, // 资源类型
      { wch: 25 }, // 资源URL
      { wch: 15 }, // 类目名称
      { wch: 25 }, // 标签
      { wch: 20 }, // 来源
      { wch: 18 }, // AI延伸解读方式
      { wch: 40 }, // AI延伸解读数据
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '导入模板');
    const xlsxBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // 打包为 ZIP（含 Excel + resources/ 空文件夹）
    const zip = new AdmZip();
    zip.addFile('导入模板.xlsx', xlsxBuffer);
    zip.addFile('resources/', Buffer.alloc(0));
    return zip.toBuffer();
  }

  /**
   * 查询导入任务状态
   */
  async getImportStatus(taskId: string): Promise<ImportTask> {
    const task = await this.importTaskRepo.findOne({ where: { id: taskId } });
    if (!task) {
      throw new NotFoundException('导入任务不存在');
    }
    return task;
  }
}
