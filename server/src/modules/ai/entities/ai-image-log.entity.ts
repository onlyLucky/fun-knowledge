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

/**
 * AI 图片识别日志实体
 */
@Entity('t_ai_image_log')
export class AiImageLog {
  @ApiProperty({ description: '日志 UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '用户 ID' })
  @Column({ type: 'uuid', comment: '用户 ID' })
  user_id: string;

  @ApiProperty({ description: '图片 URL' })
  @Column({ type: 'varchar', length: 500, comment: '图片 URL' })
  image_url: string;

  @ApiProperty({ description: '识别结果' })
  @Column({ type: 'text', comment: '识别结果' })
  result: string;

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
}
