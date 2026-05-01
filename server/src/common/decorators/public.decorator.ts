import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';

/**
 * 公开接口装饰器 - 标记接口无需认证
 */
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
