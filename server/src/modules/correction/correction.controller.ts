import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/interfaces/request.interface';
import { CorrectionService } from './correction.service';
import { CreateCorrectionDto } from './dto/create-correction.dto';
import { QueryCorrectionDto } from './dto/query-correction.dto';

@ApiTags('纠错')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('v1/correction')
export class CorrectionController {
  constructor(private readonly correctionService: CorrectionService) {}

  @Post()
  @ApiOperation({ summary: '提交纠错' })
  async create(@Body() dto: CreateCorrectionDto, @CurrentUser() user: RequestUser) {
    return this.correctionService.create(dto, user.id);
  }

  @Get('list')
  @ApiOperation({ summary: '获取我的纠错列表' })
  async findMyCorrections(
    @Query() query: QueryCorrectionDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.correctionService.findMyCorrections(user.id, query);
  }
}
