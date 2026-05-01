import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../../common/enums/user-role.enum';
import { ConfigService } from './config.service';
import { UpdateConfigDto } from './dto/update-config.dto';

@ApiTags('管理端-系统配置')
@ApiBearerAuth('access-token')
@UseGuards(AdminAuthGuard)
@Controller('admin/v1/config')
export class ConfigAdminController {
  constructor(private readonly configService: ConfigService) {}

  @Get('list')
  @Roles(AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: '获取所有系统配置' })
  async findAll() {
    return this.configService.findAll();
  }

  @Put('update')
  @Roles(AdminRole.SUPER_ADMIN)
  @ApiOperation({ summary: '更新系统配置' })
  async update(@Body() dto: UpdateConfigDto) {
    return this.configService.update(dto.config_key, dto.config_value, dto.description);
  }
}
