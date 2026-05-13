import { Request } from 'express';
import { Logger } from '@nestjs/common';
import { LogService } from '../../modules/log/log.service';

const logger = new Logger('OperationLog');

export interface LogOperationParams {
  module: string;
  action: string;
  description?: string;
  targetId?: string;
}

/**
 * 记录操作日志（异步，不阻塞响应）
 */
export function recordOperationLog(
  logService: LogService,
  request: Request,
  params: LogOperationParams,
  status = 1,
  errorMessage?: string,
): void {
  const admin = (request as any).user;
  const ip = request.ip || (request.headers['x-forwarded-for'] as string) || '';
  const userAgent = request.headers['user-agent'] || '';

  logService
    .create({
      admin_id: admin?.id || '',
      admin_username: admin?.username || '',
      module: params.module,
      action: params.action,
      target_id: params.targetId,
      description: params.description,
      request_data: sanitizeRequestData(request.body),
      ip,
      user_agent: userAgent,
      status,
      error_message: errorMessage,
    })
    .then(() => logger.debug(`写入成功: ${params.module}/${params.action}`))
    .catch((err) => logger.error(`写入失败: ${params.module}/${params.action}`, err));
}

function sanitizeRequestData(body: unknown): Record<string, unknown> | undefined {
  if (!body || typeof body !== 'object') return undefined;
  const sanitized = { ...(body as Record<string, unknown>) };
  for (const key of ['password', 'token', 'secret', 'authorization']) {
    if (key in sanitized) sanitized[key] = '***';
  }
  return sanitized;
}
