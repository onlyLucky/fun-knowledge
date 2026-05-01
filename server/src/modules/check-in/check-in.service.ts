import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CheckIn } from './entities/check-in.entity';
import { User } from '../user/entities/user.entity';
import { QueryCheckInDto } from './dto/query-check-in.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';

/**
 * 打卡服务
 */
@Injectable()
export class CheckInService {
  constructor(
    @InjectRepository(CheckIn)
    private checkInRepo: Repository<CheckIn>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  /**
   * 每日打卡
   */
  async checkIn(userId: string): Promise<CheckIn> {
    const today = this.getTodayDate();

    // 检查今天是否已打卡
    const existing = await this.checkInRepo.findOne({
      where: { user_id: userId, check_in_date: today },
    });

    if (existing) {
      throw new ConflictException('今日已打卡，请勿重复打卡');
    }

    // 计算连续打卡天数
    const yesterday = this.getYesterdayDate();
    const yesterdayRecord = await this.checkInRepo.findOne({
      where: { user_id: userId, check_in_date: yesterday },
    });

    const streakDays = yesterdayRecord ? yesterdayRecord.streak_days + 1 : 1;

    // 创建打卡记录
    const checkIn = this.checkInRepo.create({
      user_id: userId,
      check_in_date: today,
      streak_days: streakDays,
    });

    const saved = await this.checkInRepo.save(checkIn);

    // 更新用户的连续打卡天数和总打卡天数
    await this.userRepo
      .createQueryBuilder()
      .update(User)
      .set({
        streak_days: streakDays,
        total_check_in_days: () => 'total_check_in_days + 1',
      })
      .where('id = :id', { id: userId })
      .execute();

    return saved;
  }

  /**
   * 获取今日打卡状态
   */
  async getStatus(userId: string): Promise<{ checked_in: boolean; streak_days: number }> {
    const today = this.getTodayDate();

    const record = await this.checkInRepo.findOne({
      where: { user_id: userId, check_in_date: today },
    });

    const user = await this.userRepo.findOne({
      where: { id: userId },
      select: ['streak_days'],
    });

    return {
      checked_in: !!record,
      streak_days: user?.streak_days ?? 0,
    };
  }

  /**
   * 获取打卡历史（分页）
   */
  async getHistory(
    userId: string,
    query: QueryCheckInDto,
  ): Promise<PaginatedResponseDto<CheckIn>> {
    const { page = 1, pageSize = 10, month } = query;

    const qb = this.checkInRepo
      .createQueryBuilder('ci')
      .where('ci.user_id = :userId', { userId })
      .orderBy('ci.check_in_date', 'DESC');

    // 按月筛选
    if (month) {
      const startDate = `${month}-01`;
      const endMonth = this.getNextMonth(month);
      const endDate = `${endMonth}-01`;
      qb.andWhere('ci.check_in_date >= :startDate', { startDate });
      qb.andWhere('ci.check_in_date < :endDate', { endDate });
    }

    const total = await qb.getCount();
    const list = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return new PaginatedResponseDto(list, total, page, pageSize);
  }

  /**
   * 获取今天的日期字符串 (YYYY-MM-DD)
   */
  private getTodayDate(): string {
    const now = new Date();
    return this.formatDate(now);
  }

  /**
   * 获取昨天的日期字符串 (YYYY-MM-DD)
   */
  private getYesterdayDate(): string {
    const now = new Date();
    now.setDate(now.getDate() - 1);
    return this.formatDate(now);
  }

  /**
   * 格式化日期为 YYYY-MM-DD
   */
  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * 获取下一个月的 YYYY-MM 字符串
   */
  private getNextMonth(month: string): string {
    const [year, mon] = month.split('-').map(Number);
    const nextMon = mon === 12 ? 1 : mon + 1;
    const nextYear = mon === 12 ? year + 1 : year;
    return `${nextYear}-${String(nextMon).padStart(2, '0')}`;
  }
}
