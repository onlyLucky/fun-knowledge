import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequestUser } from '../../common/interfaces/request.interface';
import { AiService } from './ai.service';
import { AiExtendDto } from './dto/ai-extend.dto';
import { AiImageDto } from './dto/ai-image.dto';

@ApiTags('AI')
@ApiBearerAuth('access-token')
@UseGuards(JwtAuthGuard)
@Controller('v1/ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('extend')
  @ApiOperation({ summary: 'AI 延伸解读' })
  async extendKnowledge(
    @Body() dto: AiExtendDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.aiService.extendKnowledge(user.id, dto.knowledge_id);
  }

  @Post('image-recognize')
  @ApiOperation({ summary: 'AI 图片识别' })
  async recognizeImage(
    @Body() dto: AiImageDto,
    @CurrentUser() user: RequestUser,
  ) {
    return this.aiService.recognizeImage(user.id, dto.image_url);
  }
}
