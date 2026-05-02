import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { getAdminToken, authHeader, ADMIN_CREDENTIALS, createDirectClientToken } from './helpers/auth.helper';

describe('Auth Module (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  // ─── Client Auth: POST /api/v1/auth/login ───
  describe('POST /api/v1/auth/login', () => {
    it('should return 400 for invalid platform', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ platform: 'invalid_platform' })
        .expect(400);
    });

    it('should return 400 for email login without email', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ platform: 'email', password: 'test123' })
        .expect(400);
    });

    it('should return 400 for email login without password', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ platform: 'email', email: 'test@example.com' })
        .expect(400);
    });

    it('should return 401 for non-existent email user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ platform: 'email', email: 'nonexistent@example.com', password: 'test123456' })
        .expect(401);
      expect(res.body.message).toBeDefined();
    });

    it('should return 400 for missing platform field', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/login')
        .send({ code: 'some_code' })
        .expect(400);
    });
  });

  // ─── Client Auth: GET /api/v1/auth/profile ───
  describe('GET /api/v1/auth/profile', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .expect(401);
    });

    it('should return 401 with invalid token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/auth/profile')
        .set(authHeader('invalid-token'))
        .expect(401);
    });
  });

  // ─── Client Auth: PUT /api/v1/auth/profile ───
  describe('PUT /api/v1/auth/profile', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .put('/api/v1/auth/profile')
        .send({ nickname: 'New Name' })
        .expect(401);
    });
  });

  // ─── Client Auth: POST /api/v1/auth/bind/:platform ───
  describe('POST /api/v1/auth/bind/:platform', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/auth/bind/qq')
        .send({ code: 'test_code' })
        .expect(401);
    });
  });

  // ─── Client Auth: DELETE /api/v1/auth/unbind/:platform ───
  describe('DELETE /api/v1/auth/unbind/:platform', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .delete('/api/v1/auth/unbind/qq')
        .expect(401);
    });
  });

  // ─── Admin Auth: POST /api/admin/v1/auth/login ───
  describe('POST /api/admin/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/admin/v1/auth/login')
        .send(ADMIN_CREDENTIALS.super_admin)
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.admin).toBeDefined();
      expect(res.body.data.admin.username).toBe('admin');
      expect(res.body.data.admin.role).toBe(1);
      expect(res.body.data.tokens).toBeDefined();
      expect(res.body.data.tokens.accessToken).toBeDefined();
      expect(res.body.data.tokens.refreshToken).toBeDefined();
    });

    it('should return 401 for wrong password', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/admin/v1/auth/login')
        .send({ username: 'admin', password: 'wrongpassword' })
        .expect(401);

      expect(res.body.message).toBeDefined();
    });

    it('should return 401 for non-existent user', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/admin/v1/auth/login')
        .send({ username: 'nonexistent', password: 'admin123456' })
        .expect(401);

      expect(res.body.message).toBeDefined();
    });

    it('should return 400 for missing username', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/v1/auth/login')
        .send({ password: 'admin123456' })
        .expect(400);
    });

    it('should return 400 for missing password', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/v1/auth/login')
        .send({ username: 'admin' })
        .expect(400);
    });

    it('should login with each admin role', async () => {
      for (const [role, creds] of Object.entries(ADMIN_CREDENTIALS)) {
        const res = await request(app.getHttpServer())
          .post('/api/admin/v1/auth/login')
          .send(creds)
          .expect(200);

        expect(res.body.data.tokens.accessToken).toBeDefined();
      }
    });
  });

  // ─── Admin Auth: POST /api/admin/v1/auth/logout ───
  describe('POST /api/admin/v1/auth/logout', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/api/admin/v1/auth/logout')
        .expect(401);
    });

    it('should logout successfully with valid token', async () => {
      const token = await getAdminToken(app, 'super_admin');
      await request(app.getHttpServer())
        .post('/api/admin/v1/auth/logout')
        .set(authHeader(token))
        .expect(200);
    });
  });
});
