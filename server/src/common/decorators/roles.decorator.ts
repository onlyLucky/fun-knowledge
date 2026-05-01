import { SetMetadata } from '@nestjs/common';
import { AdminRole } from '../enums/user-role.enum';

export const ROLES_KEY = 'roles';

/**
 * 角色装饰器 - 限制接口访问角色
 */
export const Roles = (...roles: AdminRole[]) => SetMetadata(ROLES_KEY, roles);
