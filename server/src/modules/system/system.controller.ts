import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AdminAuthGuard } from '../../common/guards/admin-auth.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { AdminRole } from '../../common/enums/user-role.enum';
import { SystemService } from './system.service';
import { SystemActionDto } from './dto/system-action.dto';
import { SystemDataDto } from './dto/system-data.dto';

@ApiTags('系统管理')
@Controller('admin/v1/system')
@UseGuards(AdminAuthGuard)
@ApiBearerAuth()
@Roles(AdminRole.SUPER_ADMIN)
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('data')
  @ApiOperation({ summary: '获取所有系统管理数据' })
  async getAllData(): Promise<SystemDataDto> {
    return this.systemService.getAllData();
  }

  @Post('action')
  @ApiOperation({ summary: '执行系统管理操作' })
  async executeAction(@Body() dto: SystemActionDto): Promise<unknown> {
    return this.systemService.executeAction(dto.type, dto.params);
  }

  @Delete('resource')
  @ApiOperation({ summary: '删除单个未使用资源' })
  async deleteResource(@Query('path') resourcePath: string): Promise<{ success: boolean }> {
    return this.systemService.deleteSingleResource(resourcePath);
  }
}
