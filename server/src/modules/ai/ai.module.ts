import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiExtendLog } from './entities/ai-extend-log.entity';
import { AiImageLog } from './entities/ai-image-log.entity';
import { Knowledge } from '../knowledge/entities/knowledge.entity';
import { User } from '../user/entities/user.entity';
import { SystemConfig } from '../config/entities/system-config.entity';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([AiExtendLog, AiImageLog, Knowledge, User, SystemConfig]),
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule {}
