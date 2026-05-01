import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../user/entities/user.entity';
import { Knowledge } from '../../knowledge/entities/knowledge.entity';

/**
 * AI 延伸解读日志实体
 */
@Entity('t_ai_extend_log')
export class AiExtendLog {
  @ApiProperty({ description: '日志 UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '用户 ID' })
  @Column({ type: 'uuid', comment: '用户 ID' })
  user_id: string;

  @ApiProperty({ description: '知识卡片 ID' })
  @Column({ type: 'uuid', comment: '知识卡片 ID' })
  knowledge_id: string;

  @ApiProperty({ description: 'AI 返回内容' })
  @Column({ type: 'text', comment: 'AI 返回内容' })
  ai_content: string;

  @ApiProperty({ description: '使用 tokens 数量' })
  @Column({ type: 'int', nullable: true, comment: '使用 tokens 数量' })
  tokens_used: number;

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
