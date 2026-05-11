import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { formatDates } from '../utils/date.util';

/**
 * 统一响应格式拦截器
 */
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor<T, any> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      map((data) => {
        // 如果已经是标准格式，直接返回
        if (data && typeof data === 'object' && 'code' in data && 'data' in data) {
          return formatDates(data) as any;
        }

        return formatDates({
          code: 200,
          message: 'success',
          data,
        }) as any;
      }),
    );
  }
}
