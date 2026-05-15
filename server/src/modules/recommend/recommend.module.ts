import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { RecommendController } from './recommend.controller';
import { RecommendService } from './recommend.service';
import { RecommendProcessor } from './recommend.processor';
import { Knowledge } from '../knowledge/entities/knowledge.entity';
import { Category } from '../category/entities/category.entity';
import { Favorite } from '../favorite/entities/favorite.entity';
import { UserInterest } from './entities/user-interest.entity';
import { RecommendLog, RecommendLogSchema } from './schemas/recommend-log.schema';
import { ConfigModule } from '../config/config.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Knowledge, Category, Favorite, UserInterest]),
    MongooseModule.forFeature([
      { name: RecommendLog.name, schema: RecommendLogSchema },
    ]),
    BullModule.registerQueue({
      name: 'recommend',
    }),
    ConfigModule,
  ],
  controllers: [RecommendController],
  providers: [RecommendService, RecommendProcessor],
  exports: [RecommendService],
})
export class RecommendModule {}
