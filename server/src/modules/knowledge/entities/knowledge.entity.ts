import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Category } from '../../category/entities/category.entity';
import { Favorite } from '../../favorite/entities/favorite.entity';
import { Correction } from '../../correction/entities/correction.entity';

/**
 * 知识卡片实体
 */
@Entity('t_knowledge')
export class Knowledge {
  @ApiProperty({ description: '知识卡片 UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '标题' })
  @Column({ type: 'varchar', length: 200, comment: '标题' })
  title: string;

  @ApiProperty({ description: '内容描述' })
  @Column({ type: 'text', comment: '内容描述' })
  content: string;

  @ApiProperty({ description: '资源 URL' })
  @Column({ type: 'varchar', length: 500, nullable: true, comment: '资源 URL' })
  resource_url: string;

  @ApiProperty({ description: '资源类型', enum: ['image', 'video', 'audio', 'model_3d', 'webpage'] })
  @Column({ type: 'varchar', length: 20, nullable: true, comment: '资源类型：image/video/audio/model_3d/webpage' })
  resource_type: string;

  @ApiProperty({ description: '类目 ID' })
  @Column({ type: 'uuid', comment: '类目 ID' })
  category_id: string;

  @ApiProperty({ description: '标签列表' })
  @Column({ type: 'jsonb', nullable: true, comment: '标签列表 JSON' })
  tags: string[];

  @ApiProperty({ description: '知识来源' })
  @Column({ type: 'varchar', length: 200, nullable: true, comment: '知识来源' })
  source: string;

  @ApiProperty({ description: '卡片状态', enum: [0, 1] })
  @Column({ type: 'smallint', default: 1, comment: '状态：0-下架，1-上架' })
  status: number;

  @ApiProperty({ description: '浏览次数' })
  @Column({ type: 'int', default: 0, comment: '浏览次数' })
  view_count: number;

  @ApiProperty({ description: '收藏次数' })
  @Column({ type: 'int', default: 0, comment: '收藏次数' })
  favorite_count: number;

  @ApiProperty({ description: '纠错次数' })
  @Column({ type: 'int', default: 0, comment: '纠错次数' })
  correction_count: number;

  @ApiProperty({ description: '创建人 ID' })
  @Column({ type: 'uuid', nullable: true, comment: '创建人 ID' })
  created_by: string;

  @ApiProperty({ description: '最后修改人 ID' })
  @Column({ type: 'uuid', nullable: true, comment: '最后修改人 ID' })
  updated_by: string;

  @ApiProperty({ description: '排序权重' })
  @Column({ type: 'int', default: 0, comment: '排序权重' })
  sort_weight: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ type: 'timestamptz', comment: '创建时间' })
  created_at: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ type: 'timestamptz', comment: '更新时间' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', comment: '删除时间' })
  deleted_at: Date;

  // 关联关系
  @ManyToOne(() => Category, (category) => category.knowledges)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @OneToMany(() => Favorite, (favorite) => favorite.knowledge)
  favorites: Favorite[];

  @OneToMany(() => Correction, (correction) => correction.knowledge)
  corrections: Correction[];
}
