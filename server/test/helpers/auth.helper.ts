import { INestApplication } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import * as request from 'supertest';

/** Admin credentials from seed data */
export const ADMIN_CREDENTIALS = {
  super_admin: { username: 'admin', password: 'admin123456' },
  content_admin: { username: 'content_admin', password: 'content123456' },
  operations: { username: 'operations', password: 'operations123456' },
  reviewer: { username: 'reviewer', password: 'reviewer123456' },
};

/** Login as admin and return the access token */
export async function getAdminToken(
  app: INestApplication,
  role: keyof typeof ADMIN_CREDENTIALS = 'super_admin',
): Promise<string> {
  const creds = ADMIN_CREDENTIALS[role];
  const res = await request(app.getHttpServer())
    .post('/api/admin/v1/auth/login')
    .send(creds)
    .expect(200);

  return res.body.data.tokens.accessToken;
}

/** Create a JWT token directly for testing protected client routes */
export async function createDirectClientToken(app: INestApplication): Promise<string> {
  const jwtService = app.get(JwtService);
  const dataSource = app.get(DataSource);

  // Find or create a test user directly via SQL
  const email = 'test-e2e@example.com';
  let users = await dataSource.query(
    `SELECT id FROM t_user WHERE email = $1 LIMIT 1`,
    [email],
  );

  if (users.length === 0) {
    await dataSource.query(
      `INSERT INTO t_user (id, email, nickname, status, streak_days, total_check_in_days, ai_usage_count)
       VALUES (gen_random_uuid(), $1, 'E2E Test User', 0, 0, 0, 0)`,
      [email],
    );
    users = await dataSource.query(
      `SELECT id FROM t_user WHERE email = $1 LIMIT 1`,
      [email],
    );
  }

  const userId = users[0].id;

  const token = jwtService.sign(
    { sub: userId, type: 'access' },
    { secret: process.env.JWT_SECRET || 'default-secret-change-in-production' },
  );

  return token;
}

/** Get auth header with Bearer token */
export function authHeader(token: string): { Authorization: string } {
  return { Authorization: `Bearer ${token}` };
}
