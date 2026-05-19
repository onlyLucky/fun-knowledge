import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { OptionalJwtAuthGuard } from '../../common/guards/optional-jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { KnowledgeService } from './knowledge.service';
import { QueryKnowledgeDto } from './dto/query-knowledge.dto';

@ApiTags('知识卡片')
@UseGuards(OptionalJwtAuthGuard)
@Controller('v1/knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get('list')
  @ApiOperation({ summary: '获取知识卡片列表' })
  async findAll(@Query() query: QueryKnowledgeDto, @CurrentUser() user?: any) {
    return this.knowledgeService.findAll(query, user?.id);
  }

  @Get('hot-searches')
  @ApiOperation({ summary: '获取热搜榜单' })
  async getHotSearches(@Query('limit') limit?: number) {
    return this.knowledgeService.getHotSearches(limit ? Number(limit) : 10);
  }

  @Get(':id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})')
  @ApiOperation({ summary: '获取知识卡片详情' })
  @ApiParam({ name: 'id', description: '知识卡片 UUID' })
  async findOne(@Param('id') id: string, @CurrentUser() user?: any) {
    return this.knowledgeService.findOne(id, user?.id);
  }
}
