import { SetMetadata } from '@nestjs/common';

export const LOG_OPERATION_KEY = 'log_operation';

export interface LogOperationOptions {
  /** 操作模块，如 'knowledge'、'category' */
  module: string;
  /** 操作类型，如 'create'、'update'、'delete' */
  action: string;
  /** 操作描述 */
  description?: string;
}

/**
 * 操作日志装饰器 — 标记需要记录操作日志的接口
 */
export const LogOperation = (options: LogOperationOptions) =>
  SetMetadata(LOG_OPERATION_KEY, options);
