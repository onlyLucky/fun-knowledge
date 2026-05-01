import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { Public } from '../../common/decorators/public.decorator';
import { ConfigService } from './config.service';

@ApiTags('客户端-系统配置')
@Controller('v1')
export class ConfigController {
  constructor(private readonly configService: ConfigService) {}

  @Get('config')
  @Public()
  @ApiOperation({ summary: '获取公开系统配置（无需认证）' })
  async getPublicConfigs() {
    return this.configService.getPublicConfigs();
  }
}
