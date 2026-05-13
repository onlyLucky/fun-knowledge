import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { LOG_OPERATION_KEY, LogOperationOptions } from '../decorators/log-operation.decorator';
import { LogService } from '../../modules/log/log.service';

@Injectable()
export class OperationLogInterceptor implements NestInterceptor {
  private readonly logger = new Logger(OperationLogInterceptor.name);

  constructor(
    private readonly reflector: Reflector,
    private readonly logService: LogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const options = this.reflector.getAllAndOverride<LogOperationOptions>(
      LOG_OPERATION_KEY,
      [context.getHandler(), context.getClass()],
    );

    // 没有 @LogOperation 装饰器，直接放行
    if (!options) {
      return next.handle();
    }

    this.logger.debug(`[操作日志] 拦截到 ${options.module}/${options.action}`);

    const request = context.switchToHttp().getRequest();
    const admin = request.user;
    const ip = request.ip || request.headers['x-forwarded-for'] || '';
    const userAgent = request.headers['user-agent'] || '';
    const startTime = Date.now();

    return next.handle().pipe(
      tap({
        next: (responseData) => {
          const duration = Date.now() - startTime;
          // 提取目标 ID：优先从响应数据，其次从路径参数
          const targetId =
            responseData?.id || request.params?.id || undefined;

          this.logService
            .create({
              admin_id: admin?.id || '',
              admin_username: admin?.username || '',
              module: options.module,
              action: options.action,
              target_id: targetId,
              description: options.description,
              request_data: this.sanitizeRequestData(request.body),
              ip,
              user_agent: userAgent,
              status: 1,
              duration,
            })
            .then(() => this.logger.debug(`[操作日志] 写入成功: ${options.module}/${options.action}`))
            .catch((err) => this.logger.error('[操作日志] 写入失败', err));
        },
        error: (err) => {
          const duration = Date.now() - startTime;
          this.logger.debug(`[操作日志] 接口异常: ${options.module}/${options.action}`, err.message);
          this.logService
            .create({
              admin_id: admin?.id || '',
              admin_username: admin?.username || '',
              module: options.module,
              action: options.action,
              description: options.description,
              request_data: this.sanitizeRequestData(request.body),
              ip,
              user_agent: userAgent,
              status: 0,
              error_message: err.message,
              duration,
            })
            .catch((logErr) => this.logger.error('[操作日志] 写入失败', logErr));
        },
      }),
    );
  }

  /**
   * 清理请求数据中的敏感字段
   */
  private sanitizeRequestData(body: unknown): Record<string, unknown> | undefined {
    if (!body || typeof body !== 'object') return undefined;
    const sanitized = { ...(body as Record<string, unknown>) };
    const sensitiveKeys = ['password', 'token', 'secret', 'authorization'];
    for (const key of sensitiveKeys) {
      if (key in sanitized) {
        sanitized[key] = '***';
      }
    }
    return sanitized;
  }
}
