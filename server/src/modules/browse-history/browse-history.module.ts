import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BrowseHistory } from './entities/browse-history.entity';
import { Knowledge } from '../knowledge/entities/knowledge.entity';
import { BrowseHistoryController } from './browse-history.controller';
import { BrowseHistoryService } from './browse-history.service';

@Module({
  imports: [TypeOrmModule.forFeature([BrowseHistory, Knowledge])],
  controllers: [BrowseHistoryController],
  providers: [BrowseHistoryService],
  exports: [BrowseHistoryService],
})
export class BrowseHistoryModule {}
