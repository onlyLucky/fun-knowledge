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
import { Knowledge } from '../../knowledge/entities/knowledge.entity';

/**
 * 收藏实体
 */
@Entity('t_favorite')
@Unique(['user_id', 'knowledge_id'])
export class Favorite {
  @ApiProperty({ description: '收藏 UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '用户 ID' })
  @Column({ type: 'uuid', comment: '用户 ID' })
  user_id: string;

  @ApiProperty({ description: '知识卡片 ID' })
  @Column({ type: 'uuid', comment: '知识卡片 ID' })
  knowledge_id: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ type: 'timestamptz', comment: '创建时间' })
  created_at: Date;

  // 关联关系
  @ManyToOne(() => User, (user) => user.favorites)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Knowledge, (knowledge) => knowledge.favorites)
  @JoinColumn({ name: 'knowledge_id' })
  knowledge: Knowledge;
}
