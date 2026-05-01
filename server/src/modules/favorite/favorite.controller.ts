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
import { FavoriteService } from './favorite.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { QueryKnowledgeDto } from '../knowledge/dto/query-knowledge.dto';

@ApiTags('收藏')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('v1/favorite')
export class FavoriteController {
  constructor(private readonly favoriteService: FavoriteService) {}

  @Post()
  @ApiOperation({ summary: '添加收藏' })
  async add(@Body() dto: CreateFavoriteDto, @CurrentUser() user: RequestUser) {
    return this.favoriteService.add(user.id, dto.knowledge_id);
  }

  @Delete(':knowledge_id')
  @ApiOperation({ summary: '取消收藏' })
  @ApiParam({ name: 'knowledge_id', description: '知识卡片 UUID' })
  async remove(
    @Param('knowledge_id') knowledgeId: string,
    @CurrentUser() user: RequestUser,
  ) {
    return this.favoriteService.remove(user.id, knowledgeId);
  }

  @Get('list')
  @ApiOperation({ summary: '获取我的收藏列表' })
  async findAll(@Query() query: QueryKnowledgeDto, @CurrentUser() user: RequestUser) {
    return this.favoriteService.findAll(user.id, query);
  }
}
