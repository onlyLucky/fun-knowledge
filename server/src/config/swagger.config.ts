import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('冷知识星球 API')
  .setDescription('冷知识星球后端服务 API 文档')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: '请输入 JWT Token',
      in: 'header',
    },
    'access-token',
  )
  .addTag('认证', '用户认证相关接口')
  .addTag('知识卡片', '知识卡片相关接口')
  .addTag('类目', '类目管理相关接口')
  .addTag('收藏', '收藏相关接口')
  .addTag('纠错', '纠错相关接口')
  .addTag('打卡', '打卡相关接口')
  .addTag('AI', 'AI 延伸解读相关接口')
  .addTag('系统配置', '系统配置相关接口')
  .addTag('管理端-认证', '管理员认证相关接口')
  .addTag('管理端-知识卡片', '知识卡片管理接口')
  .addTag('管理端-用户', '用户管理接口')
  .addTag('管理端-类目', '类目管理接口')
  .addTag('管理端-纠错', '纠错管理接口')
  .addTag('管理端-配置', '系统配置管理接口')
  .addTag('管理端-日志', '操作日志接口')
  .build();
