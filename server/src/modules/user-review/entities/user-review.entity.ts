import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';

/**
 * 用户信息审核实体
 */
@Entity('t_user_review')
export class UserReview {
  @ApiProperty({ description: '审核记录 UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '用户 UUID' })
  @Column({ type: 'uuid', comment: '用户 UUID' })
  user_id: string;

  @ApiProperty({ description: '新昵称' })
  @Column({ type: 'varchar', length: 50, nullable: true, comment: '新昵称' })
  nickname: string;

  @ApiProperty({ description: '新头像 URL' })
  @Column({ type: 'varchar', length: 500, nullable: true, comment: '新头像 URL' })
  avatar: string;

  @ApiProperty({ description: '新个性签名' })
  @Column({ type: 'varchar', length: 200, nullable: true, comment: '新个性签名' })
  signature: string;

  @ApiProperty({ description: '审核状态', enum: [0, 1, 2] })
  @Column({ type: 'smallint', default: 0, comment: '审核状态：0-待审核，1-已通过，2-已驳回' })
  status: number;

  @ApiProperty({ description: '审核备注' })
  @Column({ type: 'text', nullable: true, comment: '审核备注' })
  review_remark: string | null;

  @ApiProperty({ description: '审核人 UUID' })
  @Column({ type: 'uuid', nullable: true, comment: '审核人 UUID' })
  reviewed_by: string | null;

  @ApiProperty({ description: '审核时间' })
  @Column({ type: 'timestamptz', nullable: true, comment: '审核时间' })
  review_time: Date;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ type: 'timestamptz', comment: '创建时间' })
  created_at: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ type: 'timestamptz', comment: '更新时间' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', comment: '删除时间' })
  deleted_at: Date;

  // 关联关系
  @ManyToOne(() => User, (user) => user.userReviews)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
