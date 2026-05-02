import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/app.helper';
import { authHeader, createDirectClientToken } from './helpers/auth.helper';
import { DataSource } from 'typeorm';
import { JwtService } from '@nestjs/jwt';

describe('Check-in Module (e2e)', () => {
  let app: INestApplication;
  let clientToken: string;

  beforeAll(async () => {
    app = await createTestApp();

    // Create a fresh user for check-in tests to avoid conflicts
    const dataSource = app.get(DataSource);
    const jwtService = app.get(JwtService);
    const email = `checkin-test-${Date.now()}@example.com`;

    await dataSource.query(
      `INSERT INTO t_user (id, email, nickname, status, streak_days, total_check_in_days, ai_usage_count)
       VALUES (gen_random_uuid(), $1, 'Check-in Test User', 0, 0, 0, 0)`,
      [email],
    );
    const users = await dataSource.query(`SELECT id FROM t_user WHERE email = $1`, [email]);

    clientToken = jwtService.sign(
      { sub: users[0].id, type: 'access' },
      { secret: process.env.JWT_SECRET || 'default-secret-change-in-production' },
    );
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  // ─── POST /api/v1/check-in ───
  describe('POST /api/v1/check-in', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/check-in')
        .expect(401);
    });

    it('should check in successfully', async () => {
      const res = await request(app.getHttpServer())
        .post('/api/v1/check-in')
        .set(authHeader(clientToken))
        .expect(201);

      expect(res.body.data).toBeDefined();
    });

    it('should return 409 for duplicate check-in', async () => {
      await request(app.getHttpServer())
        .post('/api/v1/check-in')
        .set(authHeader(clientToken))
        .expect(409);
    });
  });

  // ─── GET /api/v1/check-in/status ───
  describe('GET /api/v1/check-in/status', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/check-in/status')
        .expect(401);
    });

    it('should return check-in status', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/check-in/status')
        .set(authHeader(clientToken))
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.checked_in).toBeDefined();
      expect(res.body.data.streak_days).toBeDefined();
    });
  });

  // ─── GET /api/v1/check-in/history ───
  describe('GET /api/v1/check-in/history', () => {
    it('should return 401 without token', async () => {
      await request(app.getHttpServer())
        .get('/api/v1/check-in/history')
        .expect(401);
    });

    it('should return check-in history', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/check-in/history')
        .set(authHeader(clientToken))
        .expect(200);

      expect(res.body.data).toBeDefined();
      expect(res.body.data.list).toBeDefined();
      expect(Array.isArray(res.body.data.list)).toBe(true);
    });

    it('should filter by month', async () => {
      const res = await request(app.getHttpServer())
        .get('/api/v1/check-in/history?month=2026-05')
        .set(authHeader(clientToken))
        .expect(200);

      expect(res.body.data).toBeDefined();
    });
  });
});
