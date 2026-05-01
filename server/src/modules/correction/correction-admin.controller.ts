import {
  Controller,
  Get,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { AdminRole } from '../../common/enums/user-role.enum';
import { CorrectionAdminService } from './correction-admin.service';
import { QueryCorrectionDto } from './dto/query-correction.dto';
import { ReviewCorrectionDto } from './dto/review-correction.dto';
import { RequestAdmin } from '../../common/interfaces/request.interface';

@ApiTags('管理端-纠错')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@Controller('admin/v1/correction')
export class CorrectionAdminController {
  constructor(private readonly correctionAdminService: CorrectionAdminService) {}

  @Get('list')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN, AdminRole.REVIEWER)
  @ApiOperation({ summary: '获取所有纠错列表' })
  async findAll(@Query() query: QueryCorrectionDto) {
    return this.correctionAdminService.findAll(query);
  }

  @Get(':id')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN, AdminRole.REVIEWER)
  @ApiOperation({ summary: '获取纠错详情' })
  @ApiParam({ name: 'id', description: '纠错 UUID' })
  async findOne(@Param('id') id: string) {
    return this.correctionAdminService.findOne(id);
  }

  @Put(':id/review')
  @Roles(AdminRole.SUPER_ADMIN, AdminRole.CONTENT_ADMIN, AdminRole.REVIEWER)
  @ApiOperation({ summary: '审核纠错' })
  @ApiParam({ name: 'id', description: '纠错 UUID' })
  async review(
    @Param('id') id: string,
    @Body() dto: ReviewCorrectionDto,
    @CurrentUser() admin: RequestAdmin,
  ) {
    return this.correctionAdminService.review(id, dto, admin.id);
  }
}
