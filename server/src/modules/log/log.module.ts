import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { LogController } from './log.controller';
import { LogService } from './log.service';
import { OperationLog, OperationLogSchema } from './schemas/operation-log.schema';
import { OperationLogInterceptor } from '../../common/interceptors/operation-log.interceptor';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OperationLog.name, schema: OperationLogSchema },
    ]),
  ],
  controllers: [LogController],
  providers: [
    LogService,
    {
      provide: APP_INTERCEPTOR,
      useClass: OperationLogInterceptor,
    },
  ],
  exports: [LogService],
})
export class LogModule {}
