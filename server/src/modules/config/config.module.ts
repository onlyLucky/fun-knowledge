import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemConfig } from './entities/system-config.entity';
import { ConfigController } from './config.controller';
import { ConfigAdminController } from './config-admin.controller';
import { ConfigService } from './config.service';
import { LogModule } from '../log/log.module';

@Module({
  imports: [TypeOrmModule.forFeature([SystemConfig]), LogModule],
  controllers: [ConfigController, ConfigAdminController],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
