import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { LoginPlatform } from '../../common/enums/status.enum';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { User } from '../user/entities/user.entity';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { BindPlatformDto } from './dto/bind-platform.dto';

@ApiTags('客户端认证')
@UseGuards(JwtAuthGuard)
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 用户登录（多平台）
   *
   * 支持微信、QQ、抖音、手机号、邮箱、Apple ID 登录
   */
  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '用户登录',
    description: '支持微信小程序 code 登录、手机号验证码登录、邮箱密码登录等多种方式',
  })
  @ApiResponse({ status: 200, description: '登录成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  @ApiResponse({ status: 401, description: '登录失败' })
  async login(@Body() loginDto: LoginDto) {
    const result = await this.authService.login(loginDto);
    return {
      code: 0,
      message: '登录成功',
      data: {
        user: {
          id: result.user.id,
          nickname: result.user.nickname,
          avatar: result.user.avatar,
          phone: result.user.phone,
          email: result.user.email,
        },
        tokens: result.tokens,
      },
    };
  }

  /**
   * 获取当前用户资料
   */
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户资料', description: '获取当前登录用户的详细资料' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 401, description: '未登录' })
  async getProfile(@CurrentUser() user: User) {
    const profile = await this.authService.getProfile(user.id);
    return {
      code: 0,
      message: '获取成功',
      data: {
        id: profile.id,
        nickname: profile.nickname,
        avatar: profile.avatar,
        phone: profile.phone,
        email: profile.email,
        streak_days: profile.streak_days,
        total_check_in_days: profile.total_check_in_days,
        ai_usage_count: profile.ai_usage_count,
        user_auths: profile.user_auths,
        created_at: profile.created_at,
      },
    };
  }

  /**
   * 更新当前用户资料
   */
  @Put('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新用户资料', description: '更新当前登录用户的昵称、头像等信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 401, description: '未登录' })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateProfileDto,
  ) {
    const updated = await this.authService.updateProfile(user.id, dto);
    return {
      code: 0,
      message: '更新成功',
      data: {
        id: updated.id,
        nickname: updated.nickname,
        avatar: updated.avatar,
      },
    };
  }

  /**
   * 绑定平台账号
   */
  @Post('bind/:platform')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '绑定平台账号',
    description: '将第三方平台账号绑定到当前用户',
  })
  @ApiParam({
    name: 'platform',
    description: '平台标识',
    enum: LoginPlatform,
    example: LoginPlatform.QQ,
  })
  @ApiResponse({ status: 200, description: '绑定成功' })
  @ApiResponse({ status: 400, description: '参数错误或已绑定' })
  @ApiResponse({ status: 401, description: '未登录' })
  @ApiResponse({ status: 409, description: '该平台账号已被其他用户绑定' })
  async bindPlatform(
    @CurrentUser() user: User,
    @Param('platform') platform: LoginPlatform,
    @Body() dto: BindPlatformDto,
  ) {
    // 将路径参数的 platform 赋值到 DTO 中
    dto.platform = platform;
    const updated = await this.authService.bindPlatform(user.id, dto);
    return {
      code: 0,
      message: '绑定成功',
      data: {
        id: updated.id,
        user_auths: updated.user_auths,
      },
    };
  }

  /**
   * 解绑平台账号
   */
  @Delete('unbind/:platform')
  @ApiBearerAuth()
  @ApiOperation({
    summary: '解绑平台账号',
    description: '解除当前用户与指定平台的绑定关系，至少需保留一种登录方式',
  })
  @ApiParam({
    name: 'platform',
    description: '平台标识',
    enum: LoginPlatform,
    example: LoginPlatform.QQ,
  })
  @ApiResponse({ status: 200, description: '解绑成功' })
  @ApiResponse({ status: 400, description: '未绑定或至少需保留一种登录方式' })
  @ApiResponse({ status: 401, description: '未登录' })
  async unbindPlatform(
    @CurrentUser() user: User,
    @Param('platform') platform: LoginPlatform,
  ) {
    const updated = await this.authService.unbindPlatform(user.id, platform);
    return {
      code: 0,
      message: '解绑成功',
      data: {
        id: updated.id,
        user_auths: updated.user_auths,
      },
    };
  }
}
