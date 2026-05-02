import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { Public } from '../../common/decorators/public.decorator';
import { KnowledgeService } from './knowledge.service';
import { QueryKnowledgeDto } from './dto/query-knowledge.dto';

@ApiTags('知识卡片')
@Controller('v1/knowledge')
export class KnowledgeController {
  constructor(private readonly knowledgeService: KnowledgeService) {}

  @Get('list')
  @Public()
  @ApiOperation({ summary: '获取知识卡片列表' })
  async findAll(@Query() query: QueryKnowledgeDto) {
    return this.knowledgeService.findAll(query);
  }

  @Get(':id([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})')
  @Public()
  @ApiOperation({ summary: '获取知识卡片详情' })
  @ApiParam({ name: 'id', description: '知识卡片 UUID' })
  async findOne(@Param('id') id: string) {
    return this.knowledgeService.findOne(id);
  }
}
