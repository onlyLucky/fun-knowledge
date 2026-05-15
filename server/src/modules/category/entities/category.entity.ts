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
import { Knowledge } from '../../knowledge/entities/knowledge.entity';

/**
 * 类目实体
 */
@Entity('t_category')
export class Category {
  @ApiProperty({ description: '类目 UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '类目名称' })
  @Column({ type: 'varchar', length: 50, comment: '类目名称' })
  name: string;

  @ApiProperty({ description: '类目图标' })
  @Column({ type: 'varchar', length: 200, nullable: true, comment: '类目图标 URL' })
  icon: string;

  @ApiProperty({ description: '类目描述' })
  @Column({ type: 'varchar', length: 200, nullable: true, comment: '类目描述' })
  description: string;

  @ApiProperty({ description: '排序序号' })
  @Column({ type: 'int', default: 0, comment: '排序序号' })
  sort_order: number;

  @ApiProperty({ description: '运营权重 (-2 到 2)' })
  @Column({ type: 'smallint', default: 0, comment: '运营权重：-2到2' })
  weight: number;

  @ApiProperty({ description: '状态', enum: [0, 1] })
  @Column({ type: 'smallint', default: 1, comment: '状态：0-禁用，1-启用' })
  status: number;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ type: 'timestamptz', comment: '创建时间' })
  created_at: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ type: 'timestamptz', comment: '更新时间' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', comment: '删除时间' })
  deleted_at: Date;

  // 关联关系
  @OneToMany(() => Knowledge, (knowledge) => knowledge.category)
  knowledges: Knowledge[];
}
