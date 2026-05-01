import { Injectable, NotFoundException, ConflictException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { Admin } from './entities/admin.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { UpdateAdminDto } from './dto/update-admin.dto';
import { QueryAdminDto } from './dto/query-admin.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';

/**
 * 管理员服务
 */
@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(Admin)
    private readonly adminRepo: Repository<Admin>,
  ) {}

  /**
   * 分页查询管理员列表
   */
  async findAll(query: QueryAdminDto): Promise<PaginatedResponseDto<Admin>> {
    const { page = 1, pageSize = 10, username, role, status } = query;

    const where: any = {};
    if (username) {
      where.username = Like(`%${username}%`);
    }
    if (role !== undefined) {
      where.role = role;
    }
    if (status !== undefined) {
      where.status = status;
    }

    const [list, total] = await this.adminRepo.findAndCount({
      where,
      order: { created_at: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: ['id', 'username', 'real_name', 'role', 'status', 'last_login_time', 'last_login_ip', 'created_at', 'updated_at'],
    });

    return new PaginatedResponseDto(list, total, page, pageSize);
  }

  /**
   * 创建管理员
   */
  async create(dto: CreateAdminDto): Promise<Admin> {
    const existing = await this.adminRepo.findOne({
      where: { username: dto.username },
    });
    if (existing) {
      throw new ConflictException('用户名已存在');
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(dto.password, salt);

    const admin = this.adminRepo.create({
      ...dto,
      password: hashedPassword,
    });
    await this.adminRepo.save(admin);
    this.logger.log(`管理员创建成功: ${admin.username}`);

    // 排除密码返回
    const { password, ...result } = admin;
    return result as Admin;
  }

  /**
   * 更新管理员
   */
  async update(id: string, dto: UpdateAdminDto): Promise<Admin> {
    const admin = await this.findOne(id);

    // 如果更新用户名，检查唯一性
    if (dto.username && dto.username !== admin.username) {
      const existing = await this.adminRepo.findOne({
        where: { username: dto.username },
      });
      if (existing) {
        throw new ConflictException('用户名已存在');
      }
    }

    // 如果更新密码，加密处理
    if (dto.password) {
      const salt = await bcrypt.genSalt(10);
      dto.password = await bcrypt.hash(dto.password, salt);
    }

    Object.assign(admin, dto);
    await this.adminRepo.save(admin);
    this.logger.log(`管理员更新成功: ${id}`);

    // 排除密码返回
    const { password, ...result } = admin;
    return result as Admin;
  }

  /**
   * 更新管理员状态
   */
  async updateStatus(id: string, status: number): Promise<Admin> {
    const admin = await this.findOne(id);
    admin.status = status;
    await this.adminRepo.save(admin);
    this.logger.log(`管理员 ${id} 状态已更新为 ${status}`);

    const { password, ...result } = admin;
    return result as Admin;
  }

  /**
   * 根据 ID 查询管理员
   */
  private async findOne(id: string): Promise<Admin> {
    const admin = await this.adminRepo.findOne({ where: { id } });
    if (!admin) {
      throw new NotFoundException('管理员不存在');
    }
    return admin;
  }
}
