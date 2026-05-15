import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';
import { Category } from '../../category/entities/category.entity';

/**
 * 用户兴趣标签实体
 */
@Entity('t_user_interest')
@Unique(['user_id', 'type', 'category_id', 'tag_name'])
export class UserInterest {
  @ApiProperty({ description: '记录 UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '用户 ID' })
  @Column({ type: 'uuid', comment: '用户 ID' })
  user_id: string;

  @ApiProperty({ description: '兴趣类型', enum: ['category', 'tag'] })
  @Column({ type: 'varchar', length: 20, default: 'category', comment: '兴趣类型：category/tag' })
  type!: string;

  @ApiProperty({ description: '类目 ID' })
  @Column({ type: 'uuid', nullable: true, comment: '类目 ID' })
  category_id: string | null;

  @ApiProperty({ description: '标签名称' })
  @Column({ type: 'varchar', length: 50, nullable: true, comment: '标签名称' })
  tag_name: string | null;

  @ApiProperty({ description: '兴趣分数' })
  @Column({ type: 'float', default: 0, comment: '兴趣分数' })
  score: number;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ type: 'timestamptz', comment: '更新时间' })
  updated_at: Date;

  // 关联关系
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Category)
  @JoinColumn({ name: 'category_id' })
  category: Category;
}
