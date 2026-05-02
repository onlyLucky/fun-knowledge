import {
  Controller,
  Post,
  Body,
  Req,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { Admin } from '../admin/entities/admin.entity';
import { AuthAdminService } from './auth-admin.service';
import { AdminLoginDto } from './dto/admin-login.dto';

@ApiTags('管理端认证')
@UseGuards(AdminAuthGuard)
@Controller('admin/v1/auth')
export class AuthAdminController {
  constructor(private readonly authAdminService: AuthAdminService) {}

  /**
   * 管理员登录
   *
   * 使用用户名密码登录管理后台
   */
  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '管理员登录',
    description: '使用用户名和密码登录管理后台',
  })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 401, description: '用户名或密码错误' })
  @ApiResponse({ status: 403, description: '账号已被禁用' })
  async login(@Body() dto: AdminLoginDto, @Req() req: Request) {
    const ip = this.getClientIp(req);
    const result = await this.authAdminService.login(dto.username, dto.password, ip);
    return {
      code: 0,
      message: '登录成功',
      data: {
        admin: {
          id: result.admin.id,
          username: result.admin.username,
          real_name: result.admin.real_name,
          role: result.admin.role,
        },
        tokens: result.tokens,
      },
    };
  }

  /**
   * 管理员登出
   */
  @Post('logout')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '管理员登出',
    description: '退出管理后台',
  })
  @ApiResponse({ status: 200, description: '登出成功' })
  @ApiResponse({ status: 401, description: '未登录' })
  async logout(@CurrentUser() admin: Admin) {
    await this.authAdminService.logout(admin.id);
    return {
      code: 0,
      message: '登出成功',
    };
  }

  /**
   * 获取客户端真实 IP
   */
  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (forwarded) {
      return Array.isArray(forwarded) ? forwarded[0] : forwarded.split(',')[0].trim();
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
  }
}
