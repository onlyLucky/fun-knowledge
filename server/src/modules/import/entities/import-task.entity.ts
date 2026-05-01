import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 导入任务实体
 */
@Entity('t_import_task')
export class ImportTask {
  @ApiProperty({ description: '任务 UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '操作人 ID' })
  @Column({ type: 'uuid', comment: '操作人 ID' })
  admin_id: string;

  @ApiProperty({ description: '导入文件 URL' })
  @Column({ type: 'varchar', length: 500, nullable: true, comment: '导入文件 URL' })
  file_url: string;

  @ApiProperty({ description: '图片压缩包 URL' })
  @Column({ type: 'varchar', length: 500, nullable: true, comment: '图片压缩包 URL' })
  image_zip_url: string;

  @ApiProperty({ description: '总记录数' })
  @Column({ type: 'int', default: 0, comment: '总记录数' })
  total_count: number;

  @ApiProperty({ description: '成功数量' })
  @Column({ type: 'int', default: 0, comment: '成功数量' })
  success_count: number;

  @ApiProperty({ description: '失败数量' })
  @Column({ type: 'int', default: 0, comment: '失败数量' })
  fail_count: number;

  @ApiProperty({ description: '状态', enum: [0, 1, 2] })
  @Column({ type: 'smallint', default: 0, comment: '状态：0-处理中，1-成功，2-失败' })
  status: number;

  @ApiProperty({ description: '错误详情' })
  @Column({ type: 'text', nullable: true, comment: '错误详情' })
  error_log: string;

  @ApiProperty({ description: '完成时间' })
  @Column({ type: 'timestamptz', nullable: true, comment: '完成时间' })
  completed_at: Date;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ type: 'timestamptz', comment: '创建时间' })
  created_at: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ type: 'timestamptz', comment: '更新时间' })
  updated_at: Date;
}
