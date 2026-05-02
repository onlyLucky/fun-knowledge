import { INestApplication } from '@nestjs/common';
import { DataSource } from 'typeorm';

/** Get a category ID from seed data */
export async function getFirstCategoryId(app: INestApplication): Promise<string> {
  const dataSource = app.get(DataSource);
  const categories = await dataSource.query(
    `SELECT id FROM t_category WHERE deleted_at IS NULL ORDER BY sort_order ASC LIMIT 1`,
  );
  if (categories.length === 0) throw new Error('No category found - run seed first');
  return categories[0].id;
}

/** Create a test knowledge card */
export async function createTestKnowledge(
  app: INestApplication,
  overrides?: Partial<{
    title: string;
    content: string;
    category_id: string;
    status: number;
    tags: string[];
  }>,
): Promise<{ id: string; title: string; content: string; category_id: string; status: number }> {
  const dataSource = app.get(DataSource);
  const categoryId = overrides?.category_id || (await getFirstCategoryId(app));
  const title = overrides?.title || `Test Knowledge ${Date.now()}`;
  const content = overrides?.content || 'Test content for knowledge card';
  const status = overrides?.status ?? 1;
  const tags = overrides?.tags || ['test'];

  const result = await dataSource.query(
    `INSERT INTO t_knowledge (id, title, content, category_id, status, tags, image_url, source, sort_weight, view_count, favorite_count, correction_count)
     VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, '', '', 0, 0, 0, 0)
     RETURNING id, title, content, category_id, status`,
    [title, content, categoryId, status, JSON.stringify(tags)],
  );

  return result[0];
}

/** Create a test user */
export async function createTestUser(
  app: INestApplication,
  overrides?: Partial<{
    email: string;
    nickname: string;
    phone: string;
    openid: string;
    status: number;
  }>,
): Promise<{ id: string; email: string; nickname: string }> {
  const dataSource = app.get(DataSource);
  const email = overrides?.email || `test-${Date.now()}@example.com`;
  const nickname = overrides?.nickname || `Test User ${Date.now()}`;
  const status = overrides?.status ?? 0;

  const result = await dataSource.query(
    `INSERT INTO t_user (id, email, nickname, status, streak_days, total_check_in_days, ai_usage_count)
     VALUES (gen_random_uuid(), $1, $2, $3, 0, 0, 0)
     RETURNING id, email, nickname`,
    [email, nickname, status],
  );

  return result[0];
}

/** Clean up test data by table names */
export async function cleanupTestData(
  app: INestApplication,
  tables: string[],
): Promise<void> {
  const dataSource = app.get(DataSource);
  for (const table of tables) {
    await dataSource.query(`DELETE FROM ${table}`);
  }
}
