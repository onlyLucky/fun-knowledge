import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ConfigType } from '../../../common/enums/config-type.enum';

/**
 * 系统配置实体
 */
@Entity('t_system_config')
export class SystemConfig {
  @ApiProperty({ description: '配置 UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '配置键' })
  @Column({ type: 'varchar', length: 100, unique: true, comment: '配置键' })
  config_key: string;

  @ApiProperty({ description: '配置值' })
  @Column({ type: 'text', comment: '配置值' })
  config_value: string;

  @ApiProperty({ description: '配置说明' })
  @Column({ type: 'varchar', length: 200, nullable: true, comment: '配置说明' })
  description: string;

  @ApiProperty({ description: '配置分组' })
  @Column({ type: 'varchar', length: 50, nullable: true, comment: '配置分组' })
  group: string;

  @ApiProperty({ description: '配置类型', enum: ConfigType })
  @Column({
    type: 'varchar',
    length: 20,
    default: ConfigType.INPUT,
    comment: '配置类型：input/number/switch/select/textarea/color/date/json',
  })
  config_type!: ConfigType;

  @ApiProperty({ description: '配置选项（JSON，用于 switch/select 类型）' })
  @Column({ type: 'text', nullable: true, comment: '配置选项 JSON，用于 switch/select 类型' })
  options!: string | null;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ type: 'timestamptz', comment: '创建时间' })
  created_at: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ type: 'timestamptz', comment: '更新时间' })
  updated_at: Date;
}
