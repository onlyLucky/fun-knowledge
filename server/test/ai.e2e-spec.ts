import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { authHeader, createDirectClientToken } from './helpers/auth.helper';
import { createTestKnowledge } from './helpers/test-data.helper';

describe('AI Module (e2e)', () => {
  let app: INestApplication;
  let clientToken: string;
  let knowledgeId: string;

  beforeAll(async () => {
    app = await createTestApp();
    clientToken = await createDirectClientToken(app);

    const knowledge = await createTestKnowledge(app);
    knowledgeId = knowledge.id;
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  // ─── POST /api/v1/ai/extend ───
  describe('POST /api/v1/ai/extend', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/ai/extend')
        .send({ knowledge_id: knowledgeId })
        .expect(401);
    });

    it('should return 400 for invalid UUID', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/ai/extend')
        .set(authHeader(clientToken))
        .send({ knowledge_id: 'not-a-uuid' })
        .expect(400);
    });

    it('should return 400 for missing knowledge_id', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/ai/extend')
        .set(authHeader(clientToken))
        .send({})
        .expect(400);
    });

    it('should return 404 for non-existent knowledge', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/ai/extend')
        .set(authHeader(clientToken))
        .send({ knowledge_id: 'a0000000-0000-4000-8000-000000000000' })
        .expect(404);
    });
  });

  // ─── POST /api/v1/ai/image-recognize ───
  describe('POST /api/v1/ai/image-recognize', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/ai/image-recognize')
        .send({ image_url: 'https://example.com/image.jpg' })
        .expect(401);
    });

    it('should return 400 for invalid URL', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/ai/image-recognize')
        .set(authHeader(clientToken))
        .send({ image_url: 'not-a-url' })
        .expect(400);
    });

    it('should return 400 for missing image_url', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/ai/image-recognize')
        .set(authHeader(clientToken))
        .send({})
        .expect(400);
    });
  });
});
