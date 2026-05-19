import { Controller, Post, Get, Body, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/interfaces/request.interface';
import { AiService } from './ai.service';
import { AiExtendDto } from './dto/ai-extend.dto';
import { AiImageDto } from './dto/ai-image.dto';
import { AiResetDto } from './dto/ai-reset.dto';

@ApiTags('AI')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('v1/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('extend')
  @ApiOperation({ summary: 'AI 延伸解读' })
  @ApiResponse({ status: 200, description: '解读成功' })
  @ApiResponse({ status: 403, description: 'AI 使用次数已达上限' })
  async extendKnowledge(
    @Body() dto: AiExtendDto,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.aiService.extendKnowledge(user.id, dto.knowledge_id);

    if (result.limited) {
      return {
        code: 403,
        message: 'AI 使用次数已达今日上限',
        data: { usage: result.usage },
      };
    }

    return {
      code: 200,
      message: 'success',
      data: {
        ai_content: result.log!.ai_content,
        usage: result.usage,
      },
    };
  }

  @Post('image-recognize')
  @ApiOperation({ summary: 'AI 图片识别' })
  async recognizeImage(
    @Body() dto: AiImageDto,
    @CurrentUser() user: RequestUser,
  ) {
    const result = await this.aiService.recognizeImage(user.id, dto.image_url);

    if (result.limited) {
      return {
        code: 403,
        message: 'AI 使用次数已达今日上限',
        data: { usage: result.usage },
      };
    }

    return {
      code: 200,
      message: 'success',
      data: {
        result: result.log!.result,
        usage: result.usage,
      },
    };
  }

  @Get('usage')
  @ApiOperation({ summary: '获取当前用户 AI 使用信息' })
  async getUsage(@CurrentUser() user: RequestUser) {
    const usage = await this.aiService.getAiUsageInfo(user.id);
    return {
      code: 200,
      message: 'success',
      data: { usage },
    };
  }

  @Post('usage/reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '重置 AI 使用次数',
    description: '重置当前用户的 AI 使用次数，可选设置每日限额。已使用次数重置为 0。',
  })
  async resetUsage(
    @Body() dto: AiResetDto,
    @CurrentUser() user: RequestUser,
  ) {
    const usage = await this.aiService.resetAiUsage(user.id, dto.daily_limit);
    return {
      code: 200,
      message: '重置成功',
      data: { usage },
    };
  }
}
