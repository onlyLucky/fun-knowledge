import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';

/**
 * 打卡实体
 */
@Entity('t_check_in')
@Unique(['user_id', 'check_in_date'])
export class CheckIn {
  @ApiProperty({ description: '打卡 UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '用户 ID' })
  @Column({ type: 'uuid', comment: '用户 ID' })
  user_id: string;

  @ApiProperty({ description: '打卡日期' })
  @Column({ type: 'date', comment: '打卡日期' })
  check_in_date: string;

  @ApiProperty({ description: '连续打卡天数' })
  @Column({ type: 'int', default: 1, comment: '连续打卡天数' })
  streak_days: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ type: 'timestamptz', comment: '创建时间' })
  created_at: Date;

  // 关联关系
  @ManyToOne(() => User, (user) => user.checkIns)
  @JoinColumn({ name: 'user_id' })
  user: User;
}
