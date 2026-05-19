import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Favorite } from '../../favorite/entities/favorite.entity';
import { Correction } from '../../correction/entities/correction.entity';
import { CheckIn } from '../../check-in/entities/check-in.entity';
import { UserReview } from '../../user-review/entities/user-review.entity';

/**
 * 用户实体
 */
@Entity('t_user')
export class User {
  @ApiProperty({ description: '用户 UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '微信 openid' })
  @Column({ type: 'varchar', length: 100, nullable: true, unique: true, comment: '微信 openid' })
  openid: string;

  @ApiProperty({ description: '用户昵称' })
  @Column({ type: 'varchar', length: 50, nullable: true, comment: '用户昵称' })
  nickname: string;

  @ApiProperty({ description: '头像 URL' })
  @Column({ type: 'varchar', length: 500, nullable: true, comment: '头像 URL' })
  avatar: string;

  @ApiProperty({ description: '个性签名' })
  @Column({ type: 'varchar', length: 200, nullable: true, comment: '个性签名' })
  signature: string;

  @ApiProperty({ description: '手机号' })
  @Column({ type: 'varchar', length: 20, nullable: true, unique: true, comment: '手机号' })
  phone: string;

  @ApiProperty({ description: '邮箱' })
  @Column({ type: 'varchar', length: 100, nullable: true, unique: true, comment: '邮箱' })
  email: string;

  @ApiProperty({ description: '用户状态', enum: [0, 1] })
  @Column({ type: 'smallint', default: 0, comment: '状态：0-正常，1-禁用' })
  status: number;

  @ApiProperty({ description: '连续打卡天数' })
  @Column({ type: 'int', default: 0, comment: '连续打卡天数' })
  streak_days: number;

  @ApiProperty({ description: '总打卡天数' })
  @Column({ type: 'int', default: 0, comment: '总打卡天数' })
  total_check_in_days: number;

  @ApiProperty({ description: 'AI 使用次数' })
  @Column({ type: 'int', default: 0, comment: 'AI 使用次数' })
  ai_usage_count: number;

  @Column({ type: 'date', nullable: true, comment: 'AI 使用次数重置日期' })
  ai_usage_count_reset_at: string;

  @ApiProperty({ description: '多平台登录信息' })
  @Column({ type: 'jsonb', nullable: true, comment: '多平台登录信息 JSON' })
  user_auths: Record<string, any>;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ type: 'timestamptz', comment: '创建时间' })
  created_at: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ type: 'timestamptz', comment: '更新时间' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', comment: '删除时间' })
  deleted_at: Date;

  // 关联关系
  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @OneToMany(() => Correction, (correction) => correction.user)
  corrections: Correction[];

  @OneToMany(() => CheckIn, (checkIn) => checkIn.user)
  checkIns: CheckIn[];

  @OneToMany(() => UserReview, (review) => review.user)
  userReviews: UserReview[];
}
