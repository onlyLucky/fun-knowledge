import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bull';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { appConfig } from '@/config/app.config';
import { databaseConfig } from '@/config/database.config';
import { jwtConfig } from '@/config/jwt.config';
import { redisConfig } from '@/config/redis.config';
import { elasticsearchConfig } from '@/config/elasticsearch.config';

import { HttpExceptionFilter } from '@/common/filters/http-exception.filter';
import { TransformInterceptor } from '@/common/interceptors/transform.interceptor';

// All business modules
import { AuthModule } from '@/modules/auth/auth.module';
import { UserModule } from '@/modules/user/user.module';
import { KnowledgeModule } from '@/modules/knowledge/knowledge.module';
import { CategoryModule } from '@/modules/category/category.module';
import { FavoriteModule } from '@/modules/favorite/favorite.module';
import { CorrectionModule } from '@/modules/correction/correction.module';
import { CheckInModule } from '@/modules/check-in/check-in.module';
import { AiModule } from '@/modules/ai/ai.module';
import { RecommendModule } from '@/modules/recommend/recommend.module';
import { AdminModule } from '@/modules/admin/admin.module';
import { ConfigModule as AppConfigModule } from '@/modules/config/config.module';
import { ImportModule } from '@/modules/import/import.module';
import { LogModule } from '@/modules/log/log.module';

export async function createTestApp(): Promise<INestApplication> {
  const moduleFixture: TestingModule = await Test.createTestingModule({
    imports: [
      ConfigModule.forRoot({
        isGlobal: true,
        load: [appConfig, databaseConfig, jwtConfig, redisConfig, elasticsearchConfig],
        envFilePath: '.env',
      }),

      TypeOrmModule.forRootAsync({
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          type: 'postgres',
          host: configService.get<string>('DB_HOST', 'localhost'),
          port: configService.get<number>('DB_PORT', 5432),
          username: configService.get<string>('DB_USERNAME', 'postgres'),
          password: configService.get<string>('DB_PASSWORD', 'postgres'),
          database: configService.get<string>('DB_DATABASE', 'funfact'),
          entities: [__dirname + '/../../src/**/*.entity{.ts,.js}'],
          synchronize: true,
          logging: false,
          timezone: '+08:00',
        }),
      }),

      MongooseModule.forRootAsync({
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          uri: configService.get<string>('MONGODB_URI', 'mongodb://localhost:27017/funfact'),
        }),
      }),

      BullModule.forRootAsync({
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          redis: {
            host: configService.get<string>('REDIS_HOST', 'localhost'),
            port: configService.get<number>('REDIS_PORT', 6379),
            password: configService.get<string>('REDIS_PASSWORD') || undefined,
          },
        }),
      }),

      ThrottlerModule.forRootAsync({
        inject: [ConfigService],
        useFactory: () => ({
          throttlers: [
            { name: 'short', ttl: 1000, limit: 100 },
            { name: 'medium', ttl: 10000, limit: 200 },
            { name: 'long', ttl: 60000, limit: 1000 },
          ],
        }),
      }),

      AuthModule,
      UserModule,
      KnowledgeModule,
      CategoryModule,
      FavoriteModule,
      CorrectionModule,
      CheckInModule,
      AiModule,
      RecommendModule,
      AdminModule,
      AppConfigModule,
      ImportModule,
      LogModule,
    ],
    providers: [
      {
        provide: APP_GUARD,
        useClass: ThrottlerGuard,
      },
    ],
  }).compile();

  const app = moduleFixture.createNestApplication();
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  await app.init();
  return app;
}
