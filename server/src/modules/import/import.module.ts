import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BullModule } from '@nestjs/bull';
import { ImportTask } from './entities/import-task.entity';
import { Knowledge } from '../knowledge/entities/knowledge.entity';
import { Category } from '../category/entities/category.entity';
import { ImportController } from './import.controller';
import { ImportService } from './import.service';
import { ImportProcessor } from './import.processor';
import { UploadModule } from '../upload/upload.module';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([ImportTask, Knowledge, Category]),
    BullModule.registerQueue({
      name: 'knowledge-import',
    }),
    UploadModule,
    ConfigModule,
  ],
  controllers: [ImportController],
  providers: [ImportService, ImportProcessor],
  exports: [ImportService],
})
export class ImportModule {}
