import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Knowledge } from './entities/knowledge.entity';
import { Category } from '../category/entities/category.entity';
import { KnowledgeController } from './knowledge.controller';
import { KnowledgeAdminController } from './knowledge-admin.controller';
import { KnowledgeService } from './knowledge.service';
import { KnowledgeAdminService } from './knowledge-admin.service';

@Module({
  imports: [TypeOrmModule.forFeature([Knowledge, Category])],
  controllers: [KnowledgeController, KnowledgeAdminController],
  providers: [KnowledgeService, KnowledgeAdminService],
  exports: [KnowledgeService, KnowledgeAdminService],
})
export class KnowledgeModule {}
