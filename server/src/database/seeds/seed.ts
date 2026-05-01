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

const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT, 10) || 5432,
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'funfact',
  entities: [Admin, Category, SystemConfig],
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
  const count = await configRepo.count();

  if (count > 0) {
    console.log('⏭️  系统配置已存在，跳过');
    return;
  }

  const configsData = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'data/system-config.json'), 'utf-8'),
  );

  for (const configData of configsData) {
    const config = configRepo.create(configData);
    await configRepo.save(config);
  }

  console.log(`✅ 创建了 ${configsData.length} 条系统配置`);
}

seed();
