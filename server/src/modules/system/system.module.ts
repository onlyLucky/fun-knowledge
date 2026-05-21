import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Knowledge } from '../knowledge/entities/knowledge.entity';
import { User } from '../user/entities/user.entity';
import { LogModule } from '../log/log.module';
import { SystemController } from './system.controller';
import { SystemService } from './system.service';

@Module({
  imports: [TypeOrmModule.forFeature([Knowledge, User]), LogModule],
  controllers: [SystemController],
  providers: [SystemService],
})
export class SystemModule {}
