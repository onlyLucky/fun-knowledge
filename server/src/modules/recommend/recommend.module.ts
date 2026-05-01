import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { RecommendController } from './recommend.controller';
import { RecommendService } from './recommend.service';
import { Knowledge } from '../knowledge/entities/knowledge.entity';
import { Category } from '../category/entities/category.entity';
import { Favorite } from '../favorite/entities/favorite.entity';
import { UserInterest } from './entities/user-interest.entity';
import { RecommendLog, RecommendLogSchema } from './schemas/recommend-log.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([Knowledge, Category, Favorite, UserInterest]),
    MongooseModule.forFeature([
      { name: RecommendLog.name, schema: RecommendLogSchema },
    ]),
    BullModule.registerQueue({
      name: 'recommend',
    }),
  ],
  controllers: [RecommendController],
  providers: [RecommendService],
  exports: [RecommendService],
})
export class RecommendModule {}
