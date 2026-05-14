import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserReview } from './entities/user-review.entity';
import { User } from '../user/entities/user.entity';
import { UserReviewService } from './user-review.service';
import { UserReviewAdminService } from './user-review-admin.service';
import { UserReviewController } from './user-review.controller';
import { UserReviewAdminController } from './user-review-admin.controller';
import { LogModule } from '../log/log.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserReview, User]),
    LogModule,
  ],
  controllers: [UserReviewController, UserReviewAdminController],
  providers: [UserReviewService, UserReviewAdminService],
  exports: [UserReviewService],
})
export class UserReviewModule {}
