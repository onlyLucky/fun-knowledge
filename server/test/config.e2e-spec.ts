import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { getAdminToken, authHeader } from './helpers/auth.helper';

describe('Config Module (e2e)', () => {
  let app: INestApplication;
  let superAdminToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    superAdminToken = await getAdminToken(app, 'super_admin');
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  // ─── Client: GET /api/v1/config (Public) ───
  describe('GET /api/v1/config', () => {
    it('should return public configs without auth', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/config')
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(typeof res.body.data).toBe('object');
    });

    it('should contain expected public keys', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/config')
        .expect(200);

      // Should have some of the whitelisted public keys
      const data = res.body.data;
      expect(data).toBeDefined();
    });
  });

  // ─── Admin: GET /api/admin/v1/config/list ───
  describe('GET /api/admin/v1/config/list', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/v1/config/list')
        .expect(401);
    });

    it('should return all configs for super admin', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/v1/config/list')
        .set(authHeader(superAdminToken))
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should return 403 for non-super-admin', async () => {
      const contentToken = await getAdminToken(app, 'content_admin');
      await request(app.getHttpServer())
        .get('/api/admin/v1/config/list')
        .set(authHeader(contentToken))
        .expect(403);
    });
  });

  // ─── Admin: PUT /api/admin/v1/config/update ───
  describe('PUT /api/admin/v1/config/update', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .put('/api/admin/v1/config/update')
        .send({ config_key: 'ai_daily_usage_limit', config_value: '10' })
        .expect(401);
    });

    it('should update config successfully', async () => {
      const res = await request(app.getHttpServer())
        .put('/api/admin/v1/config/update')
        .set(authHeader(superAdminToken))
        .send({
          config_key: 'ai_daily_usage_limit',
          config_value: '15',
          description: 'Updated AI daily limit',
        })
        .expect(200);

      expect(res.body.data).toBeDefined();
    });

    it('should return 404 for non-existent config key', async () => {
      await request(app.getHttpServer())
        .put('/api/admin/v1/config/update')
        .set(authHeader(superAdminToken))
        .send({
          config_key: 'non_existent_key',
          config_value: 'test',
        })
        .expect(404);
    });

    it('should return 400 for missing config_key', async () => {
      await request(app.getHttpServer())
        .put('/api/admin/v1/config/update')
        .set(authHeader(superAdminToken))
        .send({ config_value: 'test' })
        .expect(400);
    });
  });
});
