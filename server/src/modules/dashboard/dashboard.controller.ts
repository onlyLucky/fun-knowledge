import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { DashboardService } from './dashboard.service';

@ApiTags('仪表盘')
@Controller('admin/v1/dashboard')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth('access-token')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('recommend-stats')
  @ApiOperation({ summary: '获取推荐效果统计数据' })
  async getRecommendStats() {
    return this.dashboardService.getRecommendStats();
  }
}
