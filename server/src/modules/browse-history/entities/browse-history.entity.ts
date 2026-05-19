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
import { Knowledge } from '../../knowledge/entities/knowledge.entity';

/**
 * 浏览历史实体
 */
@Entity('t_browse_history')
@Unique(['user_id', 'knowledge_id'])
export class BrowseHistory {
  @ApiProperty({ description: '浏览记录 UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '用户 ID' })
  @Column({ type: 'uuid', comment: '用户 ID' })
  user_id: string;

  @ApiProperty({ description: '知识卡片 ID' })
  @Column({ type: 'uuid', comment: '知识卡片 ID' })
  knowledge_id: string;

  @ApiProperty({ description: '浏览时间' })
  @UpdateDateColumn({ type: 'timestamptz', comment: '浏览时间' })
  viewed_at: Date;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ type: 'timestamptz', comment: '创建时间' })
  created_at: Date;

  // 关联关系
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Knowledge)
  @JoinColumn({ name: 'knowledge_id' })
  knowledge: Knowledge;
}
