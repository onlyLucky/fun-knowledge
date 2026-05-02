import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { createTestApp } from './helpers/app.helper';

describe('Debug', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = await createTestApp();
  }, 30000);

  afterAll(async () => {
    await app.close();
  });

  it('debug admin login', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/admin/v1/auth/login')
      .send({ username: 'admin', password: 'admin123456' });

    console.log('Admin login status:', res.status);
    console.log('Admin login body:', JSON.stringify(res.body, null, 2));
  });

  it('debug client login', async () => {
    const res = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ platform: 'email', email: 'nonexistent@example.com', password: 'test123456' });

    console.log('Client login status:', res.status);
    console.log('Client login body:', JSON.stringify(res.body, null, 2));
  });

  it('debug knowledge list', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/knowledge/list');

    console.log('Knowledge list status:', res.status);
    console.log('Knowledge list body:', JSON.stringify(res.body, null, 2));
  });

  it('debug recommend', async () => {
    const res = await request(app.getHttpServer())
      .get('/api/v1/knowledge/recommend');

    console.log('Recommend status:', res.status);
    console.log('Recommend body:', JSON.stringify(res.body, null, 2));
  });

  it('debug check-in', async () => {
    const token = await import('./helpers/auth.helper').then(m => m.createDirectClientToken(app));
    const res = await request(app.getHttpServer())
      .post('/api/v1/check-in')
      .set({ Authorization: `Bearer ${token}` });

    console.log('Check-in status:', res.status);
    console.log('Check-in body:', JSON.stringify(res.body, null, 2));
  });

  it('debug import template', async () => {
    const token = await import('./helpers/auth.helper').then(m => m.getAdminToken(app, 'content_admin'));
    const res = await request(app.getHttpServer())
      .get('/api/admin/v1/knowledge/template')
      .set({ Authorization: `Bearer ${token}` });

    console.log('Template status:', res.status);
    console.log('Template body type:', typeof res.body);
  });

  it('debug log list', async () => {
    const token = await import('./helpers/auth.helper').then(m => m.getAdminToken(app, 'super_admin'));
    const res = await request(app.getHttpServer())
      .get('/api/admin/v1/log/list')
      .set({ Authorization: `Bearer ${token}` });

    console.log('Log list status:', res.status);
    console.log('Log list body:', JSON.stringify(res.body, null, 2));
  });
});
