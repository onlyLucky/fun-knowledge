import { Controller, Get, Post, Body, Query, UseGuards, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RecommendService } from './recommend.service';
import { RecommendQueryDto } from './dto/recommend-query.dto';
import { RecommendFeedbackDto } from './dto/recommend-feedback.dto';
import { BehaviorReportDto } from './dto/behavior-report.dto';

@ApiTags('知识卡片')
@Controller('v1/knowledge')
export class RecommendController {
  constructor(private readonly recommendService: RecommendService) {}

  @Get('recommend')
  @Public()
  @ApiOperation({ summary: '获取推荐卡片列表' })
  async recommend(@Query() query: RecommendQueryDto, @CurrentUser() user?: any) {
    return this.recommendService.recommend(query, user?.id);
  }

  @Post('recommend/behavior')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '行为上报（浏览/收藏/AI延伸解读）' })
  async reportBehavior(@Body() dto: BehaviorReportDto, @CurrentUser() user: any) {
    return this.recommendService.reportBehavior(dto, user.id);
  }

  @Post('recommend/feedback')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: '推荐反馈（兼容旧接口）' })
  async feedback(@Body() dto: RecommendFeedbackDto, @CurrentUser() user: any) {
    return this.recommendService.feedback(dto, user.id);
  }
}
