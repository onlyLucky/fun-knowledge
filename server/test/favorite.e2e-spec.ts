import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { getAdminToken, authHeader, createDirectClientToken } from './helpers/auth.helper';
import { createTestKnowledge, createTestUser } from './helpers/test-data.helper';

describe('Favorite Module (e2e)', () => {
  let app: INestApplication;
  let clientToken: string;
  let knowledgeId: string;

  beforeAll(async () => {
    app = await createTestApp();
    clientToken = await createDirectClientToken(app);

    // Create a knowledge card to favorite
    const knowledge = await createTestKnowledge(app);
    knowledgeId = knowledge.id;
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  // ─── POST /api/v1/favorite ───
  describe('POST /api/v1/favorite', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/favorite')
        .send({ knowledge_id: knowledgeId })
        .expect(401);
    });

    it('should add favorite successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/favorite')
        .set(authHeader(clientToken))
        .send({ knowledge_id: knowledgeId })
        .expect(201);

      expect(res.body.data).toBeDefined();
    });

    it('should return 409 for duplicate favorite', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/favorite')
        .set(authHeader(clientToken))
        .send({ knowledge_id: knowledgeId })
        .expect(409);
    });

    it('should return 400 for missing knowledge_id', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/favorite')
        .set(authHeader(clientToken))
        .send({})
        .expect(400);
    });
  });

  // ─── GET /api/v1/favorite/list ───
  describe('GET /api/v1/favorite/list', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/favorite/list')
        .expect(401);
    });

    it('should return favorite list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/favorite/list')
        .set(authHeader(clientToken))
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.list).toBeDefined();
      expect(Array.isArray(res.body.data.list)).toBe(true);
    });
  });

  // ─── DELETE /api/v1/favorite/:knowledge_id ───
  describe('DELETE /api/v1/favorite/:knowledge_id', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/favorite/${knowledgeId}`)
        .expect(401);
    });

    it('should remove favorite successfully', async () => {
      await request(app.getHttpServer())
        .delete(`/api/v1/favorite/${knowledgeId}`)
        .set(authHeader(clientToken))
        .expect(200);
    });

    it('should return 404 for non-existent favorite', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/favorite/00000000-0000-0000-0000-000000000000')
        .set(authHeader(clientToken))
        .expect(404);
    });
  });
});
