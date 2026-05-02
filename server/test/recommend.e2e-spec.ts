import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { authHeader, createDirectClientToken } from './helpers/auth.helper';
import { createTestKnowledge, getFirstCategoryId } from './helpers/test-data.helper';

describe('Recommend Module (e2e)', () => {
  let app: INestApplication;
  let clientToken: string;
  let knowledgeId: string;
  let categoryId: string;

  beforeAll(async () => {
    app = await createTestApp();
    clientToken = await createDirectClientToken(app);
    categoryId = await getFirstCategoryId(app);

    const knowledge = await createTestKnowledge(app, { category_id: categoryId });
    knowledgeId = knowledge.id;
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  // ─── GET /api/v1/knowledge/recommend (Public) ───
  describe('GET /api/v1/knowledge/recommend', () => {
    it('should return recommendations without auth', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/knowledge/recommend')
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.list).toBeDefined();
      expect(Array.isArray(res.body.data.list)).toBe(true);
    });

    it('should support pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/knowledge/recommend?page=1&pageSize=5')
        .expect(200);

      expect(res.body.data).toBeDefined();
    });

    it('should filter by category_id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/knowledge/recommend?category_id=${categoryId}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
    });

    it('should return personalized recommendations with auth', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/knowledge/recommend')
        .set(authHeader(clientToken))
        .expect(200);

      expect(res.body.data).toBeDefined();
    });
  });

  // ─── POST /api/v1/knowledge/recommend/feedback ───
  describe('POST /api/v1/knowledge/recommend/feedback', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/knowledge/recommend/feedback')
        .send({ knowledge_id: knowledgeId, is_liked: true })
        .expect(401);
    });

    it('should submit feedback successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/knowledge/recommend/feedback')
        .set(authHeader(clientToken))
        .send({ knowledge_id: knowledgeId, is_liked: true })
        .expect(201);

      expect(res.body.data).toBeDefined();
    });

    it('should return 400 for missing knowledge_id', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/knowledge/recommend/feedback')
        .set(authHeader(clientToken))
        .send({ is_liked: true })
        .expect(400);
    });

    it('should return 400 for missing is_liked', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/knowledge/recommend/feedback')
        .set(authHeader(clientToken))
        .send({ knowledge_id: knowledgeId })
        .expect(400);
    });
  });
});
