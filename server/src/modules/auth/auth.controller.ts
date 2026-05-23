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
  Logger,
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
import { RegisterDto } from './dto/register.dto';
import { SendSmsDto } from './dto/send-sms.dto';
import { UserReviewService } from '../user-review/user-review.service';
import { SmsService } from '../sms/sms.service';
import { ConfigService as AppConfigService } from '../config/config.service';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@ApiTags('客户端认证')
@UseGuards(JwtAuthGuard)
@Controller('v1/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private readonly authService: AuthService,
    private readonly userReviewService: UserReviewService,
    private readonly smsService: SmsService,
    private readonly configService: AppConfigService,
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

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
      code: 200,
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
   * 发送短信验证码
   */
  @Post('sms/send')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '发送短信验证码', description: '向指定手机号发送 6 位验证码，有效期 5 分钟' })
  @ApiResponse({ status: 200, description: '发送成功' })
  @ApiResponse({ status: 400, description: '手机号格式错误或发送过于频繁' })
  async sendSmsCode(@Body() dto: SendSmsDto) {
    await this.smsService.sendCode(dto.phone);
    return {
      code: 200,
      message: '验证码发送成功',
      data: null,
    };
  }

  /**
   * 用户注册
   */
  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: '用户注册',
    description: '支持手机号+验证码注册和邮箱+密码注册两种方式',
  })
  @ApiResponse({ status: 201, description: '注册成功' })
  @ApiResponse({ status: 400, description: '参数错误或验证码错误' })
  @ApiResponse({ status: 409, description: '手机号或邮箱已注册' })
  async register(@Body() dto: RegisterDto) {
    const result = await this.authService.register(dto);
    return {
      code: 200,
      message: '注册成功',
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
   * 刷新令牌
   */
  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新令牌', description: '使用旧的 refresh token 换取新的 token 对' })
  @ApiResponse({ status: 200, description: '刷新成功' })
  @ApiResponse({ status: 401, description: '刷新令牌无效或已过期' })
  async refresh(@Body('refresh_token') refreshToken: string) {
    const tokens = await this.authService.refreshToken(refreshToken);
    return {
      code: 200,
      message: '刷新成功',
      data: { tokens },
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
      code: 200,
      message: '获取成功',
      data: {
        id: profile.id,
        nickname: profile.nickname,
        avatar: profile.avatar,
        signature: profile.signature,
        phone: profile.phone,
        email: profile.email,
        streak_days: profile.streak_days,
        total_check_in_days: profile.total_check_in_days,
        ai_usage_count: profile.ai_usage_count,
        user_auths: profile.user_auths,
        review_info: profile.review_info || {},
        created_at: profile.created_at,
      },
    };
  }

  /**
   * 更新当前用户资料
   */
  @Put('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新用户资料', description: '提交用户信息更新申请，需管理员审核' })
  @ApiResponse({ status: 200, description: '提交成功' })
  @ApiResponse({ status: 401, description: '未登录' })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() dto: UpdateProfileDto,
  ) {
    // 检查是否开启用户信息审核
    let reviewEnabled = true;
    try {
      const config = await this.configService.findByKey('user_review_enabled');
      reviewEnabled = config.config_value === 'true';
      this.logger.log(`用户信息审核配置: ${config.config_value}, reviewEnabled: ${reviewEnabled}`);
    } catch (error) {
      // 配置不存在时默认开启审核
      this.logger.warn(`获取用户信息审核配置失败，使用默认值: ${error}`);
    }

    this.logger.log(`更新用户资料: userId=${user.id}, reviewEnabled=${reviewEnabled}, dto=${JSON.stringify(dto)}`);

    if (reviewEnabled) {
      // 审核模式：提交审核申请
      const createResult = await this.userReviewService.create(user.id, dto);
      this.logger.log(`审核申请结果: pending=${createResult.pending}, reviewId=${createResult.review?.id}`);

      if (createResult.pending && !createResult.review) {
        // 所有字段都被拦截，无新审核记录
        return {
          code: 200,
          message: createResult.message || '请等待审核完成后再提交',
          data: null,
        };
      }

      if (!createResult.review) {
        // 无审核记录（不应该到这里，兜底处理）
        return {
          code: 200,
          message: '无需要提交的字段',
          data: null,
        };
      }

      // 更新用户的 review_info，标记审核中
      const fullUser = await this.authService.getProfile(user.id);
      const reviewInfo = { ...(fullUser.review_info || {}) };

      // 标记提交的字段为审核中
      if (dto.avatar && createResult.review.avatar) {
        reviewInfo.avatar = { status: 1, value: dto.avatar };
      }
      if (dto.nickname && createResult.review.nickname) {
        reviewInfo.nickname = { status: 1, value: dto.nickname };
      }
      if (dto.signature && createResult.review.signature) {
        reviewInfo.signature = { status: 1, value: dto.signature };
      }

      this.logger.log(`更新 review_info: ${JSON.stringify(reviewInfo)}`);
      await this.userRepo.update(user.id, { review_info: reviewInfo });
      this.logger.log(`review_info 更新成功`);

      return {
        code: 200,
        message: '提交成功，等待管理员审核',
        data: {
          pending: true,
          id: createResult.review?.id,
          status: createResult.review?.status,
        },
      };
    } else {
      // 非审核模式：直接更新
      this.logger.log('非审核模式，直接更新用户资料');
      const updateData: Partial<User> = {};
      const reviewInfo = { ...((await this.authService.getProfile(user.id)).review_info || {}) };

      if (dto.avatar) {
        updateData.avatar = dto.avatar;
        reviewInfo.avatar = { status: 0 };
      }
      if (dto.nickname) {
        updateData.nickname = dto.nickname;
        reviewInfo.nickname = { status: 0 };
      }
      if (dto.signature) {
        updateData.signature = dto.signature;
        reviewInfo.signature = { status: 0 };
      }

      updateData.review_info = reviewInfo;
      this.logger.log(`直接更新: ${JSON.stringify(updateData)}`);
      await this.userRepo.update(user.id, updateData);
      this.logger.log('直接更新成功');

      return {
        code: 200,
        message: '更新成功',
        data: { pending: false },
      };
    }
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
      code: 200,
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
      code: 200,
      message: '解绑成功',
      data: {
        id: updated.id,
        user_auths: updated.user_auths,
      },
    };
  }
}
