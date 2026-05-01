import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { OperationLog, OperationLogDocument } from './schemas/operation-log.schema';
import { QueryLogDto } from './dto/query-log.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';

@Injectable()
export class LogService {
  constructor(
    @InjectModel(OperationLog.name)
    private operationLogModel: Model<OperationLogDocument>,
  ) {}

  /**
   * 记录操作日志
   */
  async create(data: Partial<OperationLog>): Promise<OperationLog> {
    const log = new this.operationLogModel(data);
    return log.save();
  }

  /**
   * 查询操作日志列表
   */
  async findAll(query: QueryLogDto): Promise<PaginatedResponseDto<OperationLog>> {
    const { page = 1, pageSize = 10, module, action, admin_id, start_date, end_date } = query;

    const filter: any = {};

    if (module) {
      filter.module = module;
    }

    if (action) {
      filter.action = action;
    }

    if (admin_id) {
      filter.admin_id = admin_id;
    }

    if (start_date || end_date) {
      filter.created_at = {};
      if (start_date) {
        filter.created_at.$gte = new Date(start_date);
      }
      if (end_date) {
        filter.created_at.$lte = new Date(end_date);
      }
    }

    const total = await this.operationLogModel.countDocuments(filter);
    const list = await this.operationLogModel
      .find(filter)
      .sort({ created_at: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize)
      .lean();

    return new PaginatedResponseDto(list, total, page, pageSize);
  }
}
