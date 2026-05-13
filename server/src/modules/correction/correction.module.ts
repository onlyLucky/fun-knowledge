import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Correction } from './entities/correction.entity';
import { Knowledge } from '../knowledge/entities/knowledge.entity';
import { CorrectionController } from './correction.controller';
import { CorrectionAdminController } from './correction-admin.controller';
import { CorrectionService } from './correction.service';
import { CorrectionAdminService } from './correction-admin.service';
import { LogModule } from '../log/log.module';

@Module({
  imports: [TypeOrmModule.forFeature([Correction, Knowledge]), LogModule],
  controllers: [CorrectionController, CorrectionAdminController],
  providers: [CorrectionService, CorrectionAdminService],
  exports: [CorrectionService, CorrectionAdminService],
})
export class CorrectionModule {}
