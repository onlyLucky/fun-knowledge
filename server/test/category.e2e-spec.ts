import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { getAdminToken, authHeader } from './helpers/auth.helper';

describe('Category Module (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let createdCategoryId: string;

  beforeAll(async () => {
    app = await createTestApp();
    adminToken = await getAdminToken(app, 'content_admin');
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  // ─── Client: GET /api/v1/category/list (Public) ───
  describe('GET /api/v1/category/list', () => {
    it('should return category list without auth', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/category/list')
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should return categories with correct structure', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/category/list')
        .expect(200);

      const category = res.body.data[0];
      expect(category.id).toBeDefined();
      expect(category.name).toBeDefined();
    });
  });

  // ─── Admin: GET /api/admin/v1/category/list ───
  describe('GET /api/admin/v1/category/list', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/v1/category/list')
        .expect(401);
    });

    it('should return category list with admin token', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/v1/category/list')
        .set(authHeader(adminToken))
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  // ─── Admin: POST /api/admin/v1/category/create ───
  describe('POST /api/admin/v1/category/create', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/v1/category/create')
        .send({ name: 'Test Category' })
        .expect(401);
    });

    it('should create category successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/admin/v1/category/create')
        .set(authHeader(adminToken))
        .send({
          name: `Test Category ${Date.now()}`,
          description: 'A test category',
          sort_order: 99,
        })
        .expect(201);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.name).toContain('Test Category');
      createdCategoryId = res.body.data.id;
    });

    it('should return 400 for missing name', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/v1/category/create')
        .set(authHeader(adminToken))
        .send({ description: 'No name' })
        .expect(400);
    });
  });

  // ─── Admin: PUT /api/admin/v1/category/:id ───
  describe('PUT /api/admin/v1/category/:id', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .put('/api/admin/v1/category/some-id')
        .send({ name: 'Updated' })
        .expect(401);
    });

    it('should update category successfully', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/admin/v1/category/${createdCategoryId}`)
        .set(authHeader(adminToken))
        .send({ name: 'Updated Category Name' })
        .expect(200);

      expect(res.body.data).toBeDefined();
    });

    it('should return 404 for non-existent category', async () => {
      await request(app.getHttpServer())
        .put('/api/admin/v1/category/00000000-0000-0000-0000-000000000000')
        .set(authHeader(adminToken))
        .send({ name: 'Not Found' })
        .expect(404);
    });
  });

  // ─── Admin: PUT /api/admin/v1/category/sort ───
  describe('PUT /api/admin/v1/category/sort', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .put('/api/admin/v1/category/sort')
        .send({ items: [] })
        .expect(401);
    });

    it('should update sort order', async () => {
      const res = await request(app.getHttpServer())
        .put('/api/admin/v1/category/sort')
        .set(authHeader(adminToken))
        .send({
          items: [
            { id: createdCategoryId, sort_order: 100 },
          ],
        })
        .expect(200);

      expect(res.body.data).toBeDefined();
    });
  });

  // ─── Admin: DELETE /api/admin/v1/category/:id ───
  describe('DELETE /api/admin/v1/category/:id', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .delete('/api/admin/v1/category/some-id')
        .expect(401);
    });

    it('should soft delete category', async () => {
      await request(app.getHttpServer())
        .delete(`/api/admin/v1/category/${createdCategoryId}`)
        .set(authHeader(adminToken))
        .expect(200);
    });

    it('should return 404 for non-existent category', async () => {
      await request(app.getHttpServer())
        .delete('/api/admin/v1/category/00000000-0000-0000-0000-000000000000')
        .set(authHeader(adminToken))
        .expect(404);
    });
  });
});
