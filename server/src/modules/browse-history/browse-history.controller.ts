import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/interfaces/request.interface';
import { BrowseHistoryService } from './browse-history.service';
import { CreateBrowseHistoryDto } from './dto/create-browse-history.dto';
import { QueryBrowseHistoryDto } from './dto/query-browse-history.dto';
import { BatchDeleteDto } from '../../common/dto/batch-delete.dto';

@ApiTags('浏览历史')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('v1/browse-history')
export class BrowseHistoryController {
  constructor(private readonly browseHistoryService: BrowseHistoryService) {}

  @Post()
  @ApiOperation({ summary: '添加或更新浏览历史' })
  async addOrUpdate(@Body() dto: CreateBrowseHistoryDto, @CurrentUser() user: RequestUser) {
    return this.browseHistoryService.addOrUpdate(user.id, dto.knowledge_id);
  }

  @Get('list')
  @ApiOperation({ summary: '获取浏览历史列表' })
  async findAll(@Query() query: QueryBrowseHistoryDto, @CurrentUser() user: RequestUser) {
    return this.browseHistoryService.findAll(user.id, query);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除单条浏览历史' })
  @ApiParam({ name: 'id', description: '浏览记录 UUID' })
  async remove(@Param('id') id: string, @CurrentUser() user: RequestUser) {
    return this.browseHistoryService.remove(user.id, id);
  }

  @Post('batch-delete')
  @ApiOperation({ summary: '批量删除浏览历史' })
  async batchRemove(@Body() dto: BatchDeleteDto, @CurrentUser() user: RequestUser) {
    return this.browseHistoryService.batchRemove(user.id, dto.ids);
  }
}
