import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { CategoryService } from './category.service';

@ApiTags('类目')
@Controller('v1/category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('list')
  @Public()
  @ApiOperation({ summary: '获取类目列表' })
  async findAll() {
    return this.categoryService.findAll();
  }
}
