import { Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/interfaces/request.interface';
import { CheckInService } from './check-in.service';
import { QueryCheckInDto } from './dto/query-check-in.dto';

@ApiTags('打卡')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('v1/check-in')
export class CheckInController {
  constructor(private readonly checkInService: CheckInService) {}

  @Post()
  @ApiOperation({ summary: '每日打卡' })
  async checkIn(@CurrentUser() user: RequestUser) {
    return this.checkInService.checkIn(user.id);
  }

  @Get('status')
  @ApiOperation({ summary: '获取今日打卡状态' })
  async getStatus(@CurrentUser() user: RequestUser) {
    return this.checkInService.getStatus(user.id);
  }

  @Get('history')
  @ApiOperation({ summary: '获取打卡历史' })
  async getHistory(
    @Query() query: QueryCheckInDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.checkInService.getHistory(user.id, query);
  }
}
