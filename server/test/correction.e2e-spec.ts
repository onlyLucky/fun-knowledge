import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { getAdminToken, authHeader, createDirectClientToken } from './helpers/auth.helper';
import { createTestKnowledge } from './helpers/test-data.helper';

describe('Correction Module (e2e)', () => {
  let app: INestApplication;
  let clientToken: string;
  let adminToken: string;
  let knowledgeId: string;
  let correctionId: string;

  beforeAll(async () => {
    app = await createTestApp();
    clientToken = await createDirectClientToken(app);
    adminToken = await getAdminToken(app, 'reviewer');

    const knowledge = await createTestKnowledge(app);
    knowledgeId = knowledge.id;
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  // ─── Client: POST /api/v1/correction ───
  describe('POST /api/v1/correction', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/correction')
        .send({ knowledge_id: knowledgeId, type: 1, description: 'Test' })
        .expect(401);
    });

    it('should submit correction successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/correction')
        .set(authHeader(clientToken))
        .send({
          knowledge_id: knowledgeId,
          type: 1,
          description: 'Content has an error',
        })
        .expect(201);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBeDefined();
      correctionId = res.body.data.id;
    });

    it('should return 400 for missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/correction')
        .set(authHeader(clientToken))
        .send({ knowledge_id: knowledgeId })
        .expect(400);
    });

    it('should return 400 for invalid type', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/correction')
        .set(authHeader(clientToken))
        .send({ knowledge_id: knowledgeId, type: 99, description: 'Test' })
        .expect(400);
    });
  });

  // ─── Client: GET /api/v1/correction/list ───
  describe('GET /api/v1/correction/list', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/correction/list')
        .expect(401);
    });

    it('should return my corrections', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/correction/list')
        .set(authHeader(clientToken))
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.list).toBeDefined();
    });
  });

  // ─── Admin: GET /api/admin/v1/correction/list ───
  describe('GET /api/admin/v1/correction/list', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/v1/correction/list')
        .expect(401);
    });

    it('should return all corrections', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/v1/correction/list')
        .set(authHeader(adminToken))
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.list).toBeDefined();
    });
  });

  // ─── Admin: GET /api/admin/v1/correction/:id ───
  describe('GET /api/admin/v1/correction/:id', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get(`/api/admin/v1/correction/${correctionId}`)
        .expect(401);
    });

    it('should return correction detail', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/admin/v1/correction/${correctionId}`)
        .set(authHeader(adminToken))
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBe(correctionId);
    });

    it('should return 404 for non-existent correction', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/v1/correction/00000000-0000-0000-0000-000000000000')
        .set(authHeader(adminToken))
        .expect(404);
    });
  });

  // ─── Admin: PUT /api/admin/v1/correction/:id/review ───
  describe('PUT /api/admin/v1/correction/:id/review', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .put(`/api/admin/v1/correction/${correctionId}/review`)
        .send({ status: 1 })
        .expect(401);
    });

    it('should accept correction', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/admin/v1/correction/${correctionId}/review`)
        .set(authHeader(adminToken))
        .send({ status: 1, review_remark: 'Accepted' })
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.status).toBe(1);
    });

    it('should return 400 for already reviewed correction', async () => {
      await request(app.getHttpServer())
        .put(`/api/admin/v1/correction/${correctionId}/review`)
        .set(authHeader(adminToken))
        .send({ status: 2 })
        .expect(400);
    });

    it('should return 400 for invalid status value', async () => {
      // Create a new correction to review
      const newCorrection = await request(app.getHttpServer())
        .post('/api/v1/correction')
        .set(authHeader(clientToken))
        .send({
          knowledge_id: knowledgeId,
          type: 2,
          description: 'Another correction',
        });

      if (newCorrection.status === 201) {
        await request(app.getHttpServer())
          .put(`/api/admin/v1/correction/${newCorrection.body.data.id}/review`)
          .set(authHeader(adminToken))
          .send({ status: 99 })
          .expect(400);
      }
    });
  });
});
