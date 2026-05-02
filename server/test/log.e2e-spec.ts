import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { getAdminToken, authHeader } from './helpers/auth.helper';

describe('Log Module (e2e)', () => {
  let app: INestApplication;
  let superAdminToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    superAdminToken = await getAdminToken(app, 'super_admin');
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  // ─── GET /api/admin/v1/log/list ───
  describe('GET /api/admin/v1/log/list', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/v1/log/list')
        .expect(401);
    });

    it('should return log list for super admin', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/v1/log/list')
        .set(authHeader(superAdminToken))
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.list).toBeDefined();
      expect(Array.isArray(res.body.data.list)).toBe(true);
    });

    it('should support pagination', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/v1/log/list?page=1&pageSize=5')
        .set(authHeader(superAdminToken))
        .expect(200);

      expect(res.body.data.page).toBe(1);
      expect(res.body.data.pageSize).toBe(5);
    });

    it('should filter by module', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/v1/log/list?module=auth')
        .set(authHeader(superAdminToken))
        .expect(200);

      expect(res.body.data).toBeDefined();
    });

    it('should return 403 for unauthorized role', async () => {
      const contentToken = await getAdminToken(app, 'content_admin');
      await request(app.getHttpServer())
        .get('/api/admin/v1/log/list')
        .set(authHeader(contentToken))
        .expect(403);
    });

    it('should allow operations role', async () => {
      const opsToken = await getAdminToken(app, 'operations');
      const res = await request(app.getHttpServer())
        .get('/api/admin/v1/log/list')
        .set(authHeader(opsToken))
        .expect(200);

      expect(res.body.data).toBeDefined();
    });
  });
});
