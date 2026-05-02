import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { getAdminToken, authHeader } from './helpers/auth.helper';
import { createTestKnowledge, getFirstCategoryId } from './helpers/test-data.helper';

describe('Knowledge Module (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let categoryId: string;
  let knowledgeId: string;

  beforeAll(async () => {
    app = await createTestApp();
    adminToken = await getAdminToken(app, 'content_admin');
    categoryId = await getFirstCategoryId(app);

    // Create a test knowledge card for later tests
    const knowledge = await createTestKnowledge(app, { category_id: categoryId });
    knowledgeId = knowledge.id;
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  // ─── Client: GET /api/v1/knowledge/list (Public) ───
  describe('GET /api/v1/knowledge/list', () => {
    it('should return paginated knowledge list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/knowledge/list')
        .expect(200);

      expect(res.body.code).toBe(200);
      expect(res.body.data).toBeDefined();
      expect(res.body.data.list).toBeDefined();
      expect(Array.isArray(res.body.data.list)).toBe(true);
      expect(res.body.data.total).toBeDefined();
      expect(res.body.data.page).toBe(1);
      expect(res.body.data.pageSize).toBe(10);
    });

    it('should filter by category_id', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/knowledge/list?category_id=${categoryId}`)
        .expect(200);

      expect(res.body.data.list).toBeDefined();
    });

    it('should filter by title', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/knowledge/list?title=Test')
        .expect(200);

      expect(res.body.data.list).toBeDefined();
    });

    it('should support pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/knowledge/list?page=1&pageSize=5')
        .expect(200);

      expect(res.body.data.page).toBe(1);
      expect(res.body.data.pageSize).toBe(5);
    });
  });

  // ─── Client: GET /api/v1/knowledge/:id (Public) ───
  describe('GET /api/v1/knowledge/:id', () => {
    it('should return knowledge detail and increment view count', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/v1/knowledge/${knowledgeId}`)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBe(knowledgeId);
      expect(res.body.data.title).toBeDefined();
      expect(res.body.data.content).toBeDefined();
    });

    it('should return 404 for non-existent knowledge', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/knowledge/00000000-0000-0000-0000-000000000000')
        .expect(404);
    });
  });

  // ─── Admin: GET /api/admin/v1/knowledge/list ───
  describe('GET /api/admin/v1/knowledge/list', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/v1/knowledge/list')
        .expect(401);
    });

    it('should return knowledge list with admin token', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/v1/knowledge/list')
        .set(authHeader(adminToken))
        .expect(200);

      expect(res.body.data.list).toBeDefined();
      expect(Array.isArray(res.body.data.list)).toBe(true);
    });

    it('should filter by status', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/v1/knowledge/list?status=1')
        .set(authHeader(adminToken))
        .expect(200);

      expect(res.body.data.list).toBeDefined();
    });
  });

  // ─── Admin: POST /api/admin/v1/knowledge/create ───
  describe('POST /api/admin/v1/knowledge/create', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/v1/knowledge/create')
        .send({ title: 'Test', content: 'Content', category_id: categoryId })
        .expect(401);
    });

    it('should create knowledge successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/admin/v1/knowledge/create')
        .set(authHeader(adminToken))
        .send({
          title: `New Knowledge ${Date.now()}`,
          content: 'New content',
          category_id: categoryId,
          tags: ['test', 'new'],
        })
        .expect(201);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/v1/knowledge/create')
        .set(authHeader(adminToken))
        .send({ title: 'Missing content' })
        .expect(400);
    });

    it('should return 400 for empty body', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/v1/knowledge/create')
        .set(authHeader(adminToken))
        .send({})
        .expect(400);
    });
  });

  // ─── Admin: PUT /api/admin/v1/knowledge/:id ───
  describe('PUT /api/admin/v1/knowledge/:id', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .put(`/api/admin/v1/knowledge/${knowledgeId}`)
        .send({ title: 'Updated' })
        .expect(401);
    });

    it('should update knowledge successfully', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/admin/v1/knowledge/${knowledgeId}`)
        .set(authHeader(adminToken))
        .send({ title: 'Updated Title' })
        .expect(200);

      expect(res.body.data).toBeDefined();
    });

    it('should return 404 for non-existent knowledge', async () => {
      await request(app.getHttpServer())
        .put('/api/admin/v1/knowledge/00000000-0000-0000-0000-000000000000')
        .set(authHeader(adminToken))
        .send({ title: 'Not Found' })
        .expect(404);
    });
  });

  // ─── Admin: PUT /api/admin/v1/knowledge/:id/status ───
  describe('PUT /api/admin/v1/knowledge/:id/status', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .put(`/api/admin/v1/knowledge/${knowledgeId}/status`)
        .expect(401);
    });

    it('should toggle knowledge status', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/admin/v1/knowledge/${knowledgeId}/status`)
        .set(authHeader(adminToken))
        .expect(200);

      expect(res.body.data).toBeDefined();
    });
  });

  // ─── Admin: DELETE /api/admin/v1/knowledge/:id ───
  describe('DELETE /api/admin/v1/knowledge/:id', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .delete(`/api/admin/v1/knowledge/${knowledgeId}`)
        .expect(401);
    });

    it('should soft delete knowledge', async () => {
      await request(app.getHttpServer())
        .delete(`/api/admin/v1/knowledge/${knowledgeId}`)
        .set(authHeader(adminToken))
        .expect(200);
    });

    it('should return 404 for already deleted knowledge', async () => {
      await request(app.getHttpServer())
        .delete(`/api/admin/v1/knowledge/${knowledgeId}`)
        .set(authHeader(adminToken))
        .expect(404);
    });
  });
});
