import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Correction } from './entities/correction.entity';
import { Knowledge } from '../knowledge/entities/knowledge.entity';
import { CreateCorrectionDto } from './dto/create-correction.dto';
import { QueryCorrectionDto } from './dto/query-correction.dto';
import { PaginatedResponseDto } from '../../common/dto/pagination.dto';
import { CorrectionStatus } from '../../common/enums/status.enum';

/**
 * 纠错客户端服务
 */
@Injectable()
export class CorrectionService {
  constructor(
    @InjectRepository(Correction)
    private correctionRepo: Repository<Correction>,
    @InjectRepository(Knowledge)
    private knowledgeRepo: Repository<Knowledge>,
  ) {}

  /**
   * 提交纠错
   */
  async create(dto: CreateCorrectionDto, userId: string): Promise<Correction> {
    // 检查知识卡片是否存在
    const knowledge = await this.knowledgeRepo.findOne({
      where: { id: dto.knowledge_id },
    });

    if (!knowledge) {
      throw new NotFoundException('知识卡片不存在');
    }

    const correction = this.correctionRepo.create({
      ...dto,
      user_id: userId,
      status: CorrectionStatus.PENDING,
    });

    const saved = await this.correctionRepo.save(correction);

    // 增加纠错次数
    await this.knowledgeRepo.increment({ id: dto.knowledge_id }, 'correction_count', 1);

    return saved;
  }

  /**
   * 获取我的纠错列表
   */
  async findMyCorrections(
    userId: string,
    query: QueryCorrectionDto,
  ): Promise<PaginatedResponseDto<Correction>> {
    const { page = 1, pageSize = 10, status } = query;

    const qb = this.correctionRepo
      .createQueryBuilder('c')
      .leftJoinAndSelect('c.knowledge', 'k')
      .where('c.user_id = :userId', { userId });

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
}
