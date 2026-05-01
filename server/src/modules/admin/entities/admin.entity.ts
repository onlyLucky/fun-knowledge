import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 管理员实体
 */
@Entity('t_admin')
export class Admin {
  @ApiProperty({ description: '管理员 UUID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: '用户名' })
  @Column({ type: 'varchar', length: 50, unique: true, comment: '用户名' })
  username: string;

  @ApiProperty({ description: '密码' })
  @Column({ type: 'varchar', length: 255, comment: '密码（加密）' })
  password: string;

  @ApiProperty({ description: '真实姓名' })
  @Column({ type: 'varchar', length: 50, nullable: true, comment: '真实姓名' })
  real_name: string;

  @ApiProperty({ description: '角色', enum: [1, 2, 3, 4] })
  @Column({ type: 'smallint', comment: '角色：1-超管，2-内容，3-运营，4-审核' })
  role: number;

  @ApiProperty({ description: '状态', enum: [0, 1] })
  @Column({ type: 'smallint', default: 0, comment: '状态：0-正常，1-禁用' })
  status: number;

  @ApiProperty({ description: '最后登录时间' })
  @Column({ type: 'timestamptz', nullable: true, comment: '最后登录时间' })
  last_login_time: Date;

  @ApiProperty({ description: '最后登录 IP' })
  @Column({ type: 'varchar', length: 50, nullable: true, comment: '最后登录 IP' })
  last_login_ip: string;

  @ApiProperty({ description: '创建时间' })
  @CreateDateColumn({ type: 'timestamptz', comment: '创建时间' })
  created_at: Date;

  @ApiProperty({ description: '更新时间' })
  @UpdateDateColumn({ type: 'timestamptz', comment: '更新时间' })
  updated_at: Date;

  @DeleteDateColumn({ type: 'timestamptz', comment: '删除时间' })
  deleted_at: Date;
}
