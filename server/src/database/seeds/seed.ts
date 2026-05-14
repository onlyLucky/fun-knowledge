import { DataSource } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import * as path from 'path';

// 加载环境变量
dotenv.config();

// 导入实体
import { Admin } from '../../modules/admin/entities/admin.entity';
import { Category } from '../../modules/category/entities/category.entity';
import { SystemConfig } from '../../modules/config/entities/system-config.entity';
import { Knowledge } from '../../modules/knowledge/entities/knowledge.entity';
import { User } from '../../modules/user/entities/user.entity';
import { Favorite } from '../../modules/favorite/entities/favorite.entity';
import { Correction } from '../../modules/correction/entities/correction.entity';
import { CheckIn } from '../../modules/check-in/entities/check-in.entity';
import { AiExtendLog } from '../../modules/ai/entities/ai-extend-log.entity';
import { AiImageLog } from '../../modules/ai/entities/ai-image-log.entity';
import { ImportTask } from '../../modules/import/entities/import-task.entity';
import { UserInterest } from '../../modules/recommend/entities/user-interest.entity';
import { UserReview } from '../../modules/user-review/entities/user-review.entity';

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'funfact',
  entities: [Admin, Category, SystemConfig, Knowledge, User, Favorite, Correction, CheckIn, AiExtendLog, AiImageLog, ImportTask, UserInterest, UserReview],
  synchronize: true,
});

async function seed() {
  console.log('🌱 开始初始化种子数据...');

  try {
    await dataSource.initialize();
    console.log('✅ 数据库连接成功');

    // 1. 初始化管理员数据
    await seedAdmins(dataSource);

    // 2. 初始化类目数据
    await seedCategories(dataSource);

    // 3. 初始化系统配置
    await seedSystemConfigs(dataSource);

    // 4. 初始化测试用户数据
    await seedUsers(dataSource);

    // 5. 初始化用户审核数据
    await seedUserReviews(dataSource);

    console.log('🎉 种子数据初始化完成！');
  } catch (error) {
    console.error('❌ 种子数据初始化失败:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

async function seedAdmins(dataSource: DataSource) {
  const adminRepo = dataSource.getRepository(Admin);
  const count = await adminRepo.count();

  if (count > 0) {
    console.log('⏭️  管理员数据已存在，跳过');
    return;
  }

  const adminsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data/admin.json'), 'utf-8'),
  );

  for (const adminData of adminsData) {
    const hashedPassword = await bcrypt.hash(adminData.password, 10);
    const admin = adminRepo.create({
      ...adminData,
      password: hashedPassword,
    });
    await adminRepo.save(admin);
  }

  console.log(`✅ 创建了 ${adminsData.length} 个管理员账号`);
}

async function seedCategories(dataSource: DataSource) {
  const categoryRepo = dataSource.getRepository(Category);
  const count = await categoryRepo.count();

  if (count > 0) {
    console.log('⏭️  类目数据已存在，跳过');
    return;
  }

  const categoriesData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data/categories.json'), 'utf-8'),
  );

  for (const categoryData of categoriesData) {
    const category = categoryRepo.create(categoryData);
    await categoryRepo.save(category);
  }

  console.log(`✅ 创建了 ${categoriesData.length} 个类目`);
}

async function seedSystemConfigs(dataSource: DataSource) {
  const configRepo = dataSource.getRepository(SystemConfig);

  const configsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data/system-config.json'), 'utf-8'),
  );

  let created = 0;
  let skipped = 0;

  for (const configData of configsData) {
    const existing = await configRepo.findOne({
      where: { config_key: configData.config_key },
    });

    if (existing) {
      skipped++;
      continue;
    }

    const config = configRepo.create(configData);
    await configRepo.save(config);
    created++;
  }

  console.log(`✅ 系统配置：新增 ${created} 条，跳过 ${skipped} 条`);
}

async function seedUsers(dataSource: DataSource) {
  const userRepo = dataSource.getRepository(User);
  const count = await userRepo.count();

  if (count > 0) {
    console.log('⏭️  用户数据已存在，跳过');
    return;
  }

  const usersData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data/users.json'), 'utf-8'),
  );

  for (const userData of usersData) {
    const user = userRepo.create(userData);
    await userRepo.save(user);
  }

  console.log(`✅ 创建了 ${usersData.length} 个测试用户`);
}

async function seedUserReviews(dataSource: DataSource) {
  const reviewRepo = dataSource.getRepository(UserReview);
  const userRepo = dataSource.getRepository(User);
  const count = await reviewRepo.count();

  if (count > 0) {
    console.log('⏭️  用户审核数据已存在，跳过');
    return;
  }

  // 获取测试用户
  const users = await userRepo.find({ take: 10 });
  if (users.length === 0) {
    console.log('⏭️  无测试用户，跳过审核数据初始化');
    return;
  }

  const reviewsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data/user-reviews.json'), 'utf-8'),
  );

  for (let i = 0; i < reviewsData.length; i++) {
    const reviewData = reviewsData[i];
    const user = users[i % users.length];

    const review = reviewRepo.create({
      ...reviewData,
      user_id: user.id,
      reviewed_by: reviewData.status !== 0 ? users[0].id : null,
    });
    await reviewRepo.save(review);
  }

  console.log(`✅ 创建了 ${reviewsData.length} 条用户审核记录`);
}

seed();
