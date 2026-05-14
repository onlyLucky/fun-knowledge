import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Knowledge } from '../knowledge/entities/knowledge.entity';
import { CategoryController } from './category.controller';
import { CategoryAdminController } from './category-admin.controller';
import { CategoryService } from './category.service';
import { LogModule } from '../log/log.module';

@Module({
  imports: [TypeOrmModule.forFeature([Category, Knowledge]), LogModule],
  controllers: [CategoryController, CategoryAdminController],
  providers: [CategoryService],
  exports: [CategoryService],
})
export class CategoryModule {}
