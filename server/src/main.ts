import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ValidationPipe, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { join } from 'path';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const configService = app.get(ConfigService);

  // 静态文件服务（本地上传文件）
  const uploadPath = configService.get<string>('storage.localPath', './uploads');
  app.useStaticAssets(join(__dirname, '..', uploadPath), { prefix: '/uploads' });
  const logger = new Logger('Bootstrap');

  // 全局前缀
  app.setGlobalPrefix('api');

  // 全局管道 - 请求参数校验
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // 全局异常过滤器
  app.useGlobalFilters(new HttpExceptionFilter());

  // 全局响应拦截器
  app.useGlobalInterceptors(new TransformInterceptor());

  // CORS 配置
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger 文档配置
  const swaggerConfig = new DocumentBuilder()
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
    .addTag('文件上传', '客户端文件上传接口')
    .addTag('管理端-文件上传', '管理端文件上传接口')
    .addTag('管理端-日志', '操作日志接口')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  // 启动服务
  const port = configService.get<number>('APP_PORT', 3000);
  await app.listen(port);

  logger.log(`应用已启动: http://localhost:${port}`);
  logger.log(`API 文档: http://localhost:${port}/api/docs`);
}

bootstrap();
