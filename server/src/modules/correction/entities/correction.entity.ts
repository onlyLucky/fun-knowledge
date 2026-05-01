import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';
import { Knowledge } from '../../knowledge/entities/knowledge.entity';

/**
 * 纠错实体
 */
@Entity('t_correction')
export class Correction {
  @ApiProperty({ description: '纠错 UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '用户 ID' })
  @Column({ type: 'uuid', comment: '用户 ID' })
  user_id: string;

  @ApiProperty({ description: '知识卡片 ID' })
  @Column({ type: 'uuid', comment: '知识卡片 ID' })
  knowledge_id: string;

  @ApiProperty({ description: '纠错类型', enum: [1, 2, 3, 4] })
  @Column({ type: 'smallint', comment: '纠错类型：1-内容错误，2-分类错误，3-图片不符，4-其他' })
  type: number;

  @ApiProperty({ description: '纠错描述' })
  @Column({ type: 'text', comment: '纠错描述' })
  description: string;

  @ApiProperty({ description: '纠错图片' })
  @Column({ type: 'jsonb', nullable: true, comment: '纠错图片 URL 列表' })
  images: string[];

  @ApiProperty({ description: '审核状态', enum: [0, 1, 2] })
  @Column({ type: 'smallint', default: 0, comment: '状态：0-待审核，1-已采纳，2-已驳回' })
  status: number;

  @ApiProperty({ description: '审核备注' })
  @Column({ type: 'text', nullable: true, comment: '审核备注' })
  review_remark: string;

  @ApiProperty({ description: '审核人 ID' })
  @Column({ type: 'uuid', nullable: true, comment: '审核人 ID' })
  reviewed_by: string;

  @ApiProperty({ description: '审核时间' })
  @Column({ type: 'timestamptz', nullable: true, comment: '审核时间' })
  review_time: Date;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ type: 'timestamptz', comment: '创建时间' })
  created_at: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ type: 'timestamptz', comment: '更新时间' })
  updated_at: Date;

  // 关联关系
  @ManyToOne(() => User, (user) => user.corrections)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Knowledge, (knowledge) => knowledge.corrections)
  @JoinColumn({ name: 'knowledge_id' })
  knowledge: Knowledge;
}
