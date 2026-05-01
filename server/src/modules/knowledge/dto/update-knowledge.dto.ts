import { PartialType } from '@nestjs/swagger';
import { CreateKnowledgeDto } from './create-knowledge.dto';

/**
 * 更新知识卡片 DTO
 */
export class UpdateKnowledgeDto extends PartialType(CreateKnowledgeDto) {}
