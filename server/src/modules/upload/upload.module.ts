import { Module } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadAdminController } from './upload-admin.controller';
import { UploadService } from './upload.service';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [ConfigModule],
  controllers: [UploadController, UploadAdminController],
  providers: [UploadService],
  exports: [UploadService],
})
export class UploadModule {}
