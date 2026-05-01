import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Correction } from './entities/correction.entity';
import { Knowledge } from '../knowledge/entities/knowledge.entity';
import { QueryCorrectionDto } from './dto/query-correction.dto';
import { ReviewCorrectionDto } from './dto/review-correction.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { CorrectionStatus } from '../../common/enums/status.enum';

/**
 * 纠错管理端服务
 */
@Injectable()
export class CorrectionAdminService {
  constructor(
    @InjectRepository(Correction)
    private correctionRepo: Repository<Correction>,
    @InjectRepository(Knowledge)
    private knowledgeRepo: Repository<Knowledge>,
  ) {}

  /**
   * 获取所有纠错列表（管理端）
   */
  async findAll(query: QueryCorrectionDto): Promise<PaginatedResponseDto<Correction>> {
    const { page = 1, pageSize = 10, status } = query;

    const qb = this.correctionRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.knowledge', 'k')
      .leftJoinAndSelect('c.user', 'u');

    if (status !== undefined) {
      qb.andWhere('c.status = :status', { status });
    }

    qb.orderBy('c.created_at', 'DESC');

    const total = await qb.getCount();
    const list = await qb
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getMany();

    return new PaginatedResponseDto(list, total, page, pageSize);
  }

  /**
   * 获取纠错详情（管理端）
   */
  async findOne(id: string): Promise<Correction> {
    const correction = await this.correctionRepo.findOne({
      where: { id },
      relations: ['knowledge', 'user'],
    });

    if (!correction) {
      throw new NotFoundException('纠错记录不存在');
    }

    return correction;
  }

  /**
   * 审核纠错
   */
  async review(
    id: string,
    dto: ReviewCorrectionDto,
    adminId: string,
  ): Promise<Correction> {
    const correction = await this.correctionRepo.findOne({
      where: { id },
    });

    if (!correction) {
      throw new NotFoundException('纠错记录不存在');
    }

    if (correction.status !== CorrectionStatus.PENDING) {
      throw new BadRequestException('该纠错已审核，无法重复审核');
    }

    correction.status = dto.status;
    correction.review_remark = dto.review_remark || null;
    correction.reviewed_by = adminId;
    correction.review_time = new Date();

    return this.correctionRepo.save(correction);
  }
}
