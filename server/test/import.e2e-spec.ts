import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { getAdminToken, authHeader } from './helpers/auth.helper';

describe('Import Module (e2e)', () => {
  let app: INestApplication;
  let adminToken: string;

  beforeAll(async () => {
    app = await createTestApp();
    adminToken = await getAdminToken(app, 'content_admin');
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  // ─── GET /api/admin/v1/knowledge/template ───
  describe('GET /api/admin/v1/knowledge/template', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/v1/knowledge/template')
        .expect(401);
    });

    it('should download template successfully', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/admin/v1/knowledge/template')
        .set(authHeader(adminToken))
        .expect(200);

      // Should return an Excel file
      expect(res.headers['content-type']).toContain('spreadsheet');
      expect(res.body).toBeDefined();
    });
  });

  // ─── POST /api/admin/v1/knowledge/import ───
  describe('POST /api/admin/v1/knowledge/import', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/v1/knowledge/import')
        .expect(401);
    });

    it('should return 400 without file', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/v1/knowledge/import')
        .set(authHeader(adminToken))
        .expect(400);
    });
  });

  // ─── GET /api/admin/v1/knowledge/import/:id ───
  describe('GET /api/admin/v1/knowledge/import/:id', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/v1/knowledge/import/some-id')
        .expect(401);
    });

    it('should return 404 for non-existent task', async () => {
      await request(app.getHttpServer())
        .get('/api/admin/v1/knowledge/import/00000000-0000-0000-0000-000000000000')
        .set(authHeader(adminToken))
        .expect(404);
    });
  });
});
