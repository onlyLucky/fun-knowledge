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
import { ImportTask } from './entities/import-task.entity';
import { Knowledge } from '../knowledge/entities/knowledge.entity';
import { Category } from '../category/entities/category.entity';
import { ImportStatus } from '../../common/enums/status.enum';

/** 导入任务 Job 数据接口 */
interface ImportJobData {
  taskId: string;
  rows: ImportRow[];
}

/** Excel 行数据接口 */
interface ImportRow {
  title: string;
  content: string;
  image_name?: string;
  category_name: string;
  tags?: string;
  source?: string;
  admin_id: string;
}

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
  ) {}

  /**
   * 处理导入任务
   */
  @Process('import')
  async handleImport(job: Job<ImportJobData>): Promise<void> {
    const { taskId, rows } = job.data;
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

        // 解析标签
        const tags = row.tags
          ? row.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [];

        const knowledge = new Knowledge();
          knowledge.title = row.title;
          knowledge.content = row.content;
          knowledge.image_url = row.image_name || '';
          knowledge.category_id = category.id;
          knowledge.tags = tags;
          knowledge.source = row.source || '';
          knowledge.created_by = row.admin_id;
          knowledge.updated_by = row.admin_id;
          knowledge.status = 1; // 默认上架

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
