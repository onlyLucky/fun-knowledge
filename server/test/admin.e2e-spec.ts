import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { getAdminToken, authHeader } from './helpers/auth.helper';

describe('Admin Module (e2e)', () => {
  let app: INestApplication;
  let superAdminToken: string;
  let createdAdminId: string;

  beforeAll(async () => {
    app = await createTestApp();
    superAdminToken = await getAdminToken(app, 'super_admin');
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  // ─── GET /api/admin/v1/admin/list ───
  describe('GET /api/admin/v1/admin/list', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/v1/admin/list')
        .expect(401);
    });

    it('should return 403 for non-super-admin', async () => {
      const contentToken = await getAdminToken(app, 'content_admin');
      await request(app.getHttpServer())
        .get('/api/admin/v1/admin/list')
        .set(authHeader(contentToken))
        .expect(403);
    });

    it('should return admin list for super admin', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/v1/admin/list')
        .set(authHeader(superAdminToken))
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.list).toBeDefined();
      expect(Array.isArray(res.body.data.list)).toBe(true);
      expect(res.body.data.list.length).toBeGreaterThanOrEqual(4);
    });
  });

  // ─── POST /api/admin/v1/admin/create ───
  describe('POST /api/admin/v1/admin/create', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/v1/admin/create')
        .send({ username: 'test', password: 'test123456', role: 2 })
        .expect(401);
    });

    it('should create admin successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/admin/v1/admin/create')
        .set(authHeader(superAdminToken))
        .send({
          username: `test_admin_${Date.now()}`,
          password: 'test123456',
          role: 2,
          real_name: 'Test Admin',
        })
        .expect(201);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.id).toBeDefined();
      expect(res.body.data.username).toContain('test_admin_');
      expect(res.body.data.password).toBeUndefined(); // password should not be returned
      createdAdminId = res.body.data.id;
    });

    it('should return 409 for duplicate username', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/v1/admin/create')
        .set(authHeader(superAdminToken))
        .send({
          username: 'admin', // already exists from seed
          password: 'test123456',
          role: 2,
        })
        .expect(409);
    });

    it('should return 400 for missing required fields', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/v1/admin/create')
        .set(authHeader(superAdminToken))
        .send({ username: 'incomplete' })
        .expect(400);
    });

    it('should return 400 for invalid role', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/v1/admin/create')
        .set(authHeader(superAdminToken))
        .send({
          username: `invalid_role_${Date.now()}`,
          password: 'test123456',
          role: 99,
        })
        .expect(400);
    });
  });

  // ─── PUT /api/admin/v1/admin/:id ───
  describe('PUT /api/admin/v1/admin/:id', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .put('/api/admin/v1/admin/some-id')
        .send({ real_name: 'Updated' })
        .expect(401);
    });

    it('should update admin successfully', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/admin/v1/admin/${createdAdminId}`)
        .set(authHeader(superAdminToken))
        .send({ real_name: 'Updated Name' })
        .expect(200);

      expect(res.body.data).toBeDefined();
    });

    it('should return 404 for non-existent admin', async () => {
      await request(app.getHttpServer())
        .put('/api/admin/v1/admin/00000000-0000-0000-0000-000000000000')
        .set(authHeader(superAdminToken))
        .send({ real_name: 'Not Found' })
        .expect(404);
    });
  });

  // ─── PUT /api/admin/v1/admin/:id/status ───
  describe('PUT /api/admin/v1/admin/:id/status', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .put('/api/admin/v1/admin/some-id/status')
        .send({ status: 1 })
        .expect(401);
    });

    it('should update admin status', async () => {
      const res = await request(app.getHttpServer())
        .put(`/api/admin/v1/admin/${createdAdminId}/status`)
        .set(authHeader(superAdminToken))
        .send({ status: 1 })
        .expect(200);

      expect(res.body.data).toBeDefined();
    });

    it('should return 404 for non-existent admin', async () => {
      await request(app.getHttpServer())
        .put('/api/admin/v1/admin/00000000-0000-0000-0000-000000000000/status')
        .set(authHeader(superAdminToken))
        .send({ status: 0 })
        .expect(404);
    });
  });
});
