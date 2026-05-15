import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Knowledge } from '../knowledge/entities/knowledge.entity';
import { Category } from '../category/entities/category.entity';
import { Correction } from '../correction/entities/correction.entity';
import { User } from '../user/entities/user.entity';
import { UserInterest } from '../recommend/entities/user-interest.entity';
import { RecommendLog, RecommendLogSchema } from '../recommend/schemas/recommend-log.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([Knowledge, Category, Correction, User, UserInterest]),
    MongooseModule.forFeature([
      { name: RecommendLog.name, schema: RecommendLogSchema },
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
