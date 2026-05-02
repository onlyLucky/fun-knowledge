import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { getAdminToken, authHeader } from './helpers/auth.helper';
import { createTestUser } from './helpers/test-data.helper';

describe('User Module (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;
  let userId: string;

  beforeAll(async () => {
    app = await createTestApp();
    adminToken = await getAdminToken(app, 'super_admin');

    // Create a test user
    const user = await createTestUser(app);
    userId = user.id;
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  // ─── GET /api/admin/v1/user/list ───
  describe('GET /api/admin/v1/user/list', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/v1/user/list')
        .expect(401);
    });

    it('should return user list', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/v1/user/list')
        .set(authHeader(adminToken))
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.list).toBeDefined();
      expect(Array.isArray(res.body.data.list)).toBe(true);
    });

    it('should filter by nickname', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/v1/user/list?nickname=Test')
        .set(authHeader(adminToken))
        .expect(200);

      expect(res.body.data).toBeDefined();
    });

    it('should support pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/v1/user/list?page=1&pageSize=5')
        .set(authHeader(adminToken))
        .expect(200);

      expect(res.body.data.page).toBe(1);
      expect(res.body.data.pageSize).toBe(5);
    });
  });

  // ─── GET /api/admin/v1/user/:id ───
  describe('GET /api/admin/v1/user/:id', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get(`/api/admin/v1/user/${userId}`)
        .expect(401);
    });

    it('should return user detail', async () => {
      const res = await request(app.getHttpServer())
        .get(`/api/admin/v1/user/${userId}`)
        .set(authHeader(adminToken))
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBe(userId);
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/v1/user/00000000-0000-0000-0000-000000000000')
        .set(authHeader(adminToken))
        .expect(404);
    });
  });

  // ─── PUT /api/admin/v1/user/:id/status ───
  describe('PUT /api/admin/v1/user/:id/status', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .put(`/api/admin/v1/user/${userId}/status`)
        .send({ status: 1 })
        .expect(401);
    });

    it('should return 403 for non-super-admin', async () => {
      const contentToken = await getAdminToken(app, 'content_admin');
      await request(app.getHttpServer())
        .put(`/api/admin/v1/user/${userId}/status`)
        .set(authHeader(contentToken))
        .send({ status: 1 })
        .expect(403);
    });

    it('should update user status', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/admin/v1/user/${userId}/status`)
        .set(authHeader(adminToken))
        .send({ status: 1 })
        .expect(200);

      expect(res.body.data).toBeDefined();
    });

    it('should return 404 for non-existent user', async () => {
      await request(app.getHttpServer())
        .put('/api/admin/v1/user/00000000-0000-0000-0000-000000000000/status')
        .set(authHeader(adminToken))
        .send({ status: 0 })
        .expect(404);
    });
  });
});
