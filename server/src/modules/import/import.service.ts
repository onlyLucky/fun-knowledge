import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import * as XLSX from 'xlsx';
import { ImportTask } from './entities/import-task.entity';
import { ImportStatus } from '../../common/enums/status.enum';

/** Excel 行数据接口 */
interface ExcelRow {
  title: string;
  content: string;
  image_name?: string;
  category_name: string;
  tags?: string;
  source?: string;
}

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
  ) {}

  /**
   * 启动批量导入
   */
  async startImport(adminId: string, file: Express.Multer.File): Promise<ImportTask> {
    // 创建导入任务记录
    const task = this.importTaskRepo.create({
      admin_id: adminId,
      file_url: file.path || file.originalname,
      total_count: 0,
      success_count: 0,
      fail_count: 0,
      status: ImportStatus.PROCESSING,
    });
    await this.importTaskRepo.save(task);

    // 解析 Excel 文件
    const workbook = XLSX.read(file.buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const rows: ExcelRow[] = XLSX.utils.sheet_to_json(worksheet);

    // 更新任务总行数
    task.total_count = rows.length;
    await this.importTaskRepo.save(task);

    if (rows.length === 0) {
      task.status = ImportStatus.FAILED;
      task.error_log = 'Excel 文件为空';
      task.completed_at = new Date();
      await this.importTaskRepo.save(task);
      return task;
    }

    // 将行数据与 adminId 关联后推入队列
    const importRows = rows.map((row) => ({
      ...row,
      admin_id: adminId,
    }));

    await this.importQueue.add('import', {
      taskId: task.id,
      rows: importRows,
    });

    this.logger.log(`导入任务已创建: ${task.id}，共 ${rows.length} 条数据`);
    return task;
  }

  /**
   * 生成导入模板
   */
  getTemplate(): Buffer {
    const headers = ['标题', '内容', '图片文件名', '类目名称', '标签（逗号分隔）', '来源'];
    const exampleRow = ['太阳为什么是圆的', '引力使物质均匀分布...', 'sun.jpg', '科学', '天文,物理', '维基百科'];

    const worksheet = XLSX.utils.aoa_to_sheet([headers, exampleRow]);

    // 设置列宽
    worksheet['!cols'] = [
      { wch: 30 }, // 标题
      { wch: 60 }, // 内容
      { wch: 20 }, // 图片文件名
      { wch: 15 }, // 类目名称
      { wch: 25 }, // 标签
      { wch: 20 }, // 来源
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '导入模板');

    return XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
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
