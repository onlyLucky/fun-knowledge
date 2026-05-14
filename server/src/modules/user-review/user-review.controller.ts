import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/interfaces/request.interface';
import { UserReviewService } from './user-review.service';
import { CreateUserReviewDto } from './dto/create-user-review.dto';

@ApiTags('客户端-用户信息审核')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('v1/user-review')
export class UserReviewController {
  constructor(private readonly userReviewService: UserReviewService) {}

  @Post()
  @ApiOperation({ summary: '提交用户信息更新审核' })
  async create(@Body() dto: CreateUserReviewDto, @CurrentUser() user: RequestUser) {
    return this.userReviewService.create(user.id, dto);
  }

  @Get('list')
  @ApiOperation({ summary: '获取我的审核记录' })
  async findMyReviews(@CurrentUser() user: RequestUser) {
    return this.userReviewService.findMyReviews(user.id);
  }
}
