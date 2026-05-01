import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { LogController } from './log.controller';
import { LogService } from './log.service';
import { OperationLog, OperationLogSchema } from './schemas/operation-log.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: OperationLog.name, schema: OperationLogSchema },
    ]),
  ],
  controllers: [LogController],
  providers: [LogService],
  exports: [LogService],
})
export class LogModule {}
