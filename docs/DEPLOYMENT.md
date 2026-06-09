# 冷知识星球 - 云服务器部署指南

> 本文档详细说明如何将 FunFact 项目（app/、server/、manage/）部署到云服务器。

## 部署环境

| 环境 | 状态 | 说明 |
|------|------|------|
| 测试环境 (HTTP) | ✅ 当前 | 快速部署，用于功能验证 |
| 生产环境 (HTTPS) | 📋 TODO | 配置 SSL 证书、域名、安全加固 |

## 目录

- [架构概览](#架构概览)
- [服务器配置建议](#服务器配置建议)
- [环境准备](#环境准备)
- [项目配置](#项目配置)
- [Docker 配置](#docker-配置)
- [Nginx 配置](#nginx-配置)
- [启动服务](#启动服务)
- [运维命令](#运维命令)
- [常见问题](#常见问题)
- [TODO - 生产环境部署](#todo---生产环境部署)

---

## 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                      云服务器 (Linux)                        │
│                                                             │
│  ┌─────────┐    ┌─────────────────────────────────────┐    │
│  │  Nginx   │    │         Docker Network              │    │
│  │  (80/443)│    │                                     │    │
│  │          │    │  ┌─────────┐  ┌─────────────────┐  │    │
│  │  / ──────┼───►│  │  app/   │  │   PostgreSQL    │  │    │
│  │  /manage─┼───►│  │ (nginx) │  │   Redis         │  │    │
│  │  /api ───┼───►│  └─────────┘  │   MongoDB       │  │    │
│  │          │    │               │   Elasticsearch  │  │    │
│  └─────────┘    │  ┌─────────┐  └─────────────────┘  │    │
│                 │  │ server/ │                        │    │
│                 │  │ (node)  │                        │    │
│                 │  └─────────┘                        │    │
│                 └─────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

### 组件说明

| 组件 | 技术栈 | 说明 |
|------|--------|------|
| app/ | React 18 + Vite | 前端应用，Nginx 托管静态资源 |
| manage/ | React 19 + Vite | 管理后台，Nginx 托管静态资源 |
| server/ | NestJS | 后端 API 服务 |
| PostgreSQL 16 | - | 主数据库 |
| Redis 7 | - | 缓存、队列、限流 |
| MongoDB 7 | - | 操作日志存储 |
| Elasticsearch 8 | - | 搜索引擎 |

---

## 服务器配置建议

| 项目 | 最低配置 | 推荐配置 | 当前配置 |
|------|----------|----------|----------|
| CPU | 2 核 | 4 核 | 2 核 ✅ |
| 内存 | 4 GB | 8 GB | 3.3 GB ⚠️ |
| 硬盘 | 40 GB SSD | 100 GB SSD | 69 GB ✅ |
| 系统 | Ubuntu 22.04 LTS | Ubuntu 22.04 LTS | 22.04.5 ✅ |
| Docker | 20.x | 最新 | 29.5.3 ✅ |

### 当前服务器信息

```
OS:       Ubuntu 22.04.5 LTS (Jammy Jellyfish)
Kernel:   5.15.0-181-generic
CPU:      Intel Xeon Platinum 8255C @ 2.50GHz (2核)
Memory:   3.3 GB
Disk:     69 GB (剩余 59 GB)
Docker:   29.5.3 + Compose 5.1.4
```

### 内存优化方案

当前 3.3GB 内存需要精打细算，按以下方案分配：

| 服务 | 内存限制 | 说明 |
|------|----------|------|
| PostgreSQL | 256 MB | 足够小型应用 |
| Redis | 128 MB | 足够缓存使用 |
| MongoDB | 256 MB | 日志存储 |
| Elasticsearch | 384 MB | 降低 JVM 堆大小 |
| server | 512 MB | Node.js 应用 |
| app + manage | 64 MB | Nginx 静态服务 |
| 系统保留 | ~500 MB | 操作系统 |
| **合计** | **~2 GB** | 预留 1.3 GB 缓冲 |

> ⚠️ **注意**：如果内存仍然紧张，可以考虑暂时禁用 Elasticsearch，使用数据库全文搜索替代。

---

## 环境准备

### 1. 更新系统

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. 安装 Docker

```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 将当前用户添加到 docker 组
sudo usermod -aG docker $USER

# 重新登录使权限生效
newgrp docker

# 验证安装
docker --version
```

### 3. 安装 Docker Compose

```bash
sudo apt install docker-compose-plugin -y

# 验证安装
docker compose version
```

### 4. 安装 Nginx

```bash
sudo apt install nginx -y

# 启动并设置开机自启
sudo systemctl start nginx
sudo systemctl enable nginx

# 验证安装
nginx -v
```

### 5. 安装 Git

```bash
sudo apt install git -y
```

---

## 项目配置

### 1. 克隆代码

```bash
# 创建项目目录
sudo mkdir -p /home/funfact-server/FunFact
sudo chown $USER:$USER /home/funfact-server/FunFact

# 克隆代码
cd /home/funfact-server/FunFact
git clone <你的仓库地址> .
```

### 2. 创建环境变量文件

项目根目录已有完整的环境变量模板 `.env.production.example`，直接复制并修改：

```bash
cd /home/funfact-server/FunFact

# 复制模板
cp .env.production.example .env.production

# 编辑配置（必须修改密码和密钥）
vi .env.production
```

**必须修改的配置项**：

| 配置项 | 说明 | 生成方式 |
|--------|------|----------|
| `POSTGRES_PASSWORD` | PostgreSQL 密码 | 自定义强密码 |
| `REDIS_PASSWORD` | Redis 密码 | 自定义强密码 |
| `MONGO_PASSWORD` | MongoDB 密码 | 自定义强密码 |
| `JWT_SECRET` | JWT 签名密钥 | `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"` |
| `JWT_REFRESH_SECRET` | JWT 刷新密钥 | 同上 |

**可选配置项**（不使用可留空）：

| 配置项 | 说明 |
|--------|------|
| `WECHAT_APP_ID/SECRET` | 微信小程序登录 |
| `QQ_APP_ID/KEY` | QQ 登录 |
| `DOUYIN_APP_ID/SECRET` | 抖音登录 |
| `APPLE_*` | Apple 登录 |
| `ALIYUN_OSS_*` | 阿里云图片存储 |
| `AI_API_*` | AI 服务 |

> 💡 **提示**：完整配置请查看 `.env.production.example` 文件。

---

## Docker 配置

### 1. 创建 app/ Dockerfile

创建文件 `app/Dockerfile`：

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

创建文件 `app/nginx.conf`：

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # 处理 SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 2. 创建 manage/ Dockerfile

创建文件 `manage/Dockerfile`：

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

创建文件 `manage/nginx.conf`：

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # 处理 SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. 创建生产环境 Docker Compose

创建文件 `docker-compose.prod.yml`：

```yaml
version: '3.8'

services:
  # ==================== 基础设施服务 ====================

  postgres:
    image: postgres:16-alpine
    container_name: funfact-postgres
    restart: unless-stopped
    environment:
      POSTGRES_USER: ${POSTGRES_USER:-postgres}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: funfact
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - funfact-network
    deploy:
      resources:
        limits:
          memory: 256M
    healthcheck:
      test: ['CMD-SHELL', 'pg_isready -U postgres']
      interval: 10s
      timeout: 5s
      retries: 5

  redis:
    image: redis:7-alpine
    container_name: funfact-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD} --maxmemory 96mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    networks:
      - funfact-network
    deploy:
      resources:
        limits:
          memory: 128M
    healthcheck:
      test: ['CMD', 'redis-cli', '-a', '${REDIS_PASSWORD}', 'ping']
      interval: 10s
      timeout: 5s
      retries: 5

  mongodb:
    image: mongo:7
    container_name: funfact-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_USERNAME: ${MONGO_USER:-admin}
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: funfact
    volumes:
      - mongodb_data:/data/db
    networks:
      - funfact-network
    deploy:
      resources:
        limits:
          memory: 256M
    healthcheck:
      test: echo 'db.runCommand("ping").ok' | mongosh --quiet
      interval: 10s
      timeout: 5s
      retries: 5

  elasticsearch:
    image: elasticsearch:8.11.3
    container_name: funfact-elasticsearch
    restart: unless-stopped
    environment:
      - discovery.type=single-node
      - xpack.security.enabled=false
      - ES_JAVA_OPTS=-Xms256m -Xmx256m
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - funfact-network
    deploy:
      resources:
        limits:
          memory: 384M
    healthcheck:
      test: ['CMD-SHELL', 'curl -f http://localhost:9200/_cluster/health || exit 1']
      interval: 10s
      timeout: 5s
      retries: 5

  # ==================== 应用服务 ====================

  server:
    build:
      context: ./server
      dockerfile: Dockerfile
    container_name: funfact-server
    restart: unless-stopped
    ports:
      - '127.0.0.1:3000:3000'
    env_file:
      - .env.production
    environment:
      # 数据库连接配置
      DB_HOST: postgres
      DB_PORT: 5432
      DB_USERNAME: ${POSTGRES_USER:-postgres}
      DB_PASSWORD: ${POSTGRES_PASSWORD}
      DB_DATABASE: funfact

      # Redis 配置
      REDIS_HOST: redis
      REDIS_PORT: 6379
      REDIS_PASSWORD: ${REDIS_PASSWORD}

      # MongoDB 配置
      MONGODB_URI: mongodb://${MONGO_USER:-admin}:${MONGO_PASSWORD}@mongodb:27017/funfact?authSource=admin

      # Elasticsearch 配置
      ELASTICSEARCH_NODE: http://elasticsearch:9200

      # 应用配置
      APP_PORT: 3000
      NODE_ENV: production
    deploy:
      resources:
        limits:
          memory: 512M
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
      mongodb:
        condition: service_healthy
      elasticsearch:
        condition: service_healthy
    networks:
      - funfact-network

  app:
    build:
      context: ./app
      dockerfile: Dockerfile
    container_name: funfact-app
    restart: unless-stopped
    ports:
      - '127.0.0.1:8080:80'
    deploy:
      resources:
        limits:
          memory: 32M
    networks:
      - funfact-network

  manage:
    build:
      context: ./manage
      dockerfile: Dockerfile
    container_name: funfact-manage
    restart: unless-stopped
    ports:
      - '127.0.0.1:8081:80'
    deploy:
      resources:
        limits:
          memory: 32M
    networks:
      - funfact-network

# ==================== 数据卷 ====================
volumes:
  postgres_data:
  redis_data:
  mongodb_data:
  elasticsearch_data:

# ==================== 网络 ====================
networks:
  funfact-network:
    driver: bridge
```

> 💡 **内存优化说明**：
> - 所有服务都设置了 `deploy.resources.limits.memory` 限制
> - Elasticsearch JVM 堆大小从 512m 降至 256m
> - Redis 添加了 `maxmemory 96mb` 和 LRU 淘汰策略
> - 总内存限制约 1.6GB，预留足够空间给系统

---

## Nginx 配置

### 1. 创建站点配置

创建文件 `/etc/nginx/sites-available/funfact`：

```nginx
# 上游服务定义
upstream app_server {
    server 127.0.0.1:8080;
}

upstream manage_server {
    server 127.0.0.1:8081;
}

upstream api_server {
    server 127.0.0.1:3000;
}

# 主站 - 前端应用 (HTTP)
server {
    listen 80;
    server_name 159.75.167.99;

    # 前端应用
    location / {
        proxy_pass http://app_server;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API 代理
    location /api {
        proxy_pass http://api_server;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket 支持（如果需要）
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Swagger 文档
    location /api/docs {
        proxy_pass http://api_server;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# 管理后台 (HTTP)
server {
    listen 80;
    server_name 159.75.167.99;

    # 使用路径前缀区分，或使用不同端口
    location /manage {
        proxy_pass http://manage_server;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # API 代理
    location /manage/api {
        proxy_pass http://api_server/api;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

> 💡 **测试环境说明**：管理后台可以通过 `http://159.75.167.99/manage` 或直接访问 `http://159.75.167.99:8081` 访问。

### 2. 启用站点

```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/funfact /etc/nginx/sites-enabled/

# 删除默认站点（可选）
sudo rm /etc/nginx/sites-enabled/default

# 测试配置
sudo nginx -t

# 重新加载 Nginx
sudo systemctl reload nginx
```

---

## 数据同步到云服务器

### 1. 代码同步（Git）

```bash
# 方式一：直接克隆（推荐）
cd /home/funfact-server
git clone <你的仓库地址> FunFact

# 方式二：从本地推送（如果没有远程仓库）
# 本地执行
cd /Users/feynman/Documents/code/2026/@IDEA/FunFact
git remote add production ssh://root@159.75.167.99/home/funfact-server/FunFact.git

# 服务器执行（初始化裸仓库）
ssh root@159.75.167.99
mkdir -p /home/funfact-server/FunFact.git
cd /home/funfact-server/FunFact.git
git init --bare

# 本地推送
git push production main
```

### 2. 环境变量同步

```bash
# 方式一：本地编辑后上传（推荐）
# 本地修改好 .env.production 后
scp .env.production root@159.75.167.99:/home/funfact-server/FunFact/

# 方式二：服务器上直接编辑
ssh root@159.75.167.99
cd /home/funfact-server/FunFact
cp .env.production.example .env.production
vi .env.production
```

### 3. 数据库数据同步（本地 Docker → 云服务器）

#### 3.0 前置任务

**步骤一：确认本地 Docker 服务运行状态**

```bash
# 查看 Docker 是否运行
docker info

# 查看本地运行的数据库容器
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}"

# 预期输出（容器应显示 Up 状态）：
# NAMES                IMAGE                 STATUS          PORTS
# funfact-postgres     postgres:16-alpine    Up 2 hours      0.0.0.0:5432->5432/tcp
# funfact-mongodb      mongo:7               Up 2 hours      0.0.0.0:27017->27017/tcp
# funfact-redis        redis:7-alpine        Up 2 hours      0.0.0.0:6379->6379/tcp
# funfact-elasticsearch elasticsearch:8.11.3 Up 2 hours      0.0.0.0:9200->9200/tcp
```

**步骤二：确认数据库连接信息**

```bash
# 查看本地环境变量配置
cat /Users/feynman/Documents/code/2026/@IDEA/FunFact/server/.env | grep -E "^(DB_|REDIS_|MONGO_)"

# 预期输出：
# DB_HOST=localhost
# DB_PORT=5432
# DB_USERNAME=postgres
# DB_PASSWORD=postgres
# DB_DATABASE=funfact
# REDIS_HOST=localhost
# REDIS_PORT=6379
# REDIS_PASSWORD=
# MONGODB_URI=mongodb://admin:admin@localhost:27017/funfact?authSource=admin
```

**步骤三：测试数据库连接**

```bash
# 测试 PostgreSQL 连接
docker exec funfact-postgres psql -U postgres -c "SELECT 1;"

# 测试 MongoDB 连接
docker exec funfact-mongodb mongosh -u admin -p admin --eval "db.runCommand({ping:1})"

# 测试 Redis 连接
docker exec funfact-redis redis-cli ping
```

**步骤四：检查磁盘空间**

```bash
# 检查本地磁盘空间（确保有足够空间存放备份）
df -h /tmp

# 检查数据库大小
# PostgreSQL 数据库大小
docker exec funfact-postgres psql -U postgres -c "SELECT pg_size_pretty(pg_database_size('funfact'));"

# MongoDB 数据库大小
docker exec funfact-mongodb mongosh -u admin -p admin --eval "use funfact; db.stats().dataSize"
```

**步骤五：停止应用服务（可选，确保数据一致性）**

```bash
# 如果正在运行本地 server，建议先停止
# 进入项目目录
cd /Users/feynman/Documents/code/2026/@IDEA/FunFact/server

# 停止本地开发服务器（如果在运行）
# Ctrl+C 或关闭终端

# 注意：数据库容器保持运行，只停止应用服务
```

**步骤六：创建备份目录**

```bash
# 创建项目内备份目录（推荐）
mkdir -p /Users/feynman/Documents/code/2026/@IDEA/FunFact/tmp

# 或创建系统临时目录
mkdir -p /tmp/funfact-backup
```

#### 3.1 确认本地 Docker 容器名称

```bash
# 再次确认容器名称（用于后续导出命令）
docker ps --format "{{.Names}}" | grep funfact

# 输出示例：
# funfact-postgres
# funfact-mongodb
# funfact-redis
# funfact-elasticsearch
```

#### 3.2 导出本地 Docker 数据库

```bash
# 定义项目根目录
PROJECT_ROOT="/Users/feynman/Documents/code/2026/@IDEA/FunFact"

# 创建项目内备份目录
mkdir -p $PROJECT_ROOT/tmp

# 导出 PostgreSQL
docker exec funfact-postgres pg_dump -U postgres funfact > $PROJECT_ROOT/tmp/postgres_$(date +%Y%m%d).sql

# 导出 MongoDB（需要认证）
docker exec funfact-mongodb mongodump --username admin --password admin --authenticationDatabase admin --archive --gzip > $PROJECT_ROOT/tmp/mongodb_$(date +%Y%m%d).gz

# 导出 Redis（先触发 RDB 快照）
docker exec funfact-redis redis-cli save
docker cp funfact-redis:/data/dump.rdb $PROJECT_ROOT/tmp/redis_$(date +%Y%m%d).rdb

# 查看导出文件
ls -lh $PROJECT_ROOT/tmp/
```

#### 3.3 上传备份到云服务器

**方式一：使用 scp 上传（简单直接）**

```bash
# 上传所有备份文件到云服务器
scp /Users/feynman/Documents/code/2026/@IDEA/FunFact/tmp/* root@159.75.167.99:/home/funfact-server/

# 分别上传（可选，便于查看进度）
scp /Users/feynman/Documents/code/2026/@IDEA/FunFact/tmp/postgres_*.sql root@159.75.167.99:/home/funfact-server/
scp /Users/feynman/Documents/code/2026/@IDEA/FunFact/tmp/mongodb_*.gz root@159.75.167.99:/home/funfact-server/
scp /Users/feynman/Documents/code/2026/@IDEA/FunFact/tmp/redis_*.rdb root@159.75.167.99:/home/funfact-server/
```

**方式二：使用 rsync 上传（推荐，支持断点续传和进度显示）**

```bash
rsync -avz --progress /Users/feynman/Documents/code/2026/@IDEA/FunFact/tmp/ root@159.75.167.99:/home/funfact-server/backup/
```

**方式三：打包后上传（文件较多时推荐）**

```bash
# 打包所有备份文件
cd /Users/feynman/Documents/code/2026/@IDEA/FunFact/tmp
tar -czf funfact-db-backup-$(date +%Y%m%d).tar.gz *.sql *.gz *.rdb

# 上传打包文件
scp funfact-db-backup-*.tar.gz root@159.75.167.99:/home/funfact-server/

# 在云服务器解压
ssh root@159.75.167.99 "cd /home/funfact-server && tar -xzf funfact-db-backup-*.tar.gz"
```

**验证上传成功**：

```bash
# 在云服务器上查看文件
ssh root@159.75.167.99 "ls -lh /home/funfact-server/*.sql /home/funfact-server/*.gz /home/funfact-server/*.rdb"
```

#### 3.4 在云服务器导入数据

```bash
# 登录云服务器
ssh root@159.75.167.99
cd /home/funfact-server/FunFact

# 确保数据库服务已启动
docker compose -f docker-compose.prod.yml up -d postgres mongodb redis elasticsearch
sleep 30

# 查看服务状态
docker compose -f docker-compose.prod.yml ps
```

**导入 PostgreSQL**：
```bash
# 方式一：如果服务器数据库为空（首次部署）
docker exec -i funfact-postgres psql -U postgres funfact < /home/funfact-server/postgres_*.sql

# 方式二：如果需要覆盖现有数据
# 先清空数据库
docker exec funfact-postgres psql -U postgres -c "DROP DATABASE IF EXISTS funfact;"
docker exec funfact-postgres psql -U postgres -c "CREATE DATABASE funfact;"
# 再导入
docker exec -i funfact-postgres psql -U postgres funfact < /home/funfact-server/postgres_*.sql
```

**导入 MongoDB**：
```bash
# 方式一：直接导入
docker exec -i funfact-mongodb mongorestore --username admin --password admin --authenticationDatabase admin --archive --gzip < /home/funfact-server/mongodb_*.gz

# 方式二：如果需要覆盖，先删除旧数据再导入
docker exec funfact-mongodb mongosh -u admin -p your_mongo_password --eval "use funfact; db.dropDatabase()"
docker exec -i funfact-mongodb mongorestore --username admin --password admin --authenticationDatabase admin --archive --gzip < /home/funfact-server/mongodb_*.gz
```

**导入 Redis**：
```bash
# 停止 Redis
docker compose -f docker-compose.prod.yml stop redis

# 替换 RDB 文件
docker cp /home/funfact-server/redis_*.rdb funfact-redis:/data/dump.rdb

# 重启 Redis
docker compose -f docker-compose.prod.yml start redis
```

#### 3.5 验证数据同步

```bash
# 验证 PostgreSQL
docker exec funfact-postgres psql -U postgres funfact -c "SELECT count(*) FROM t_knowledge;"

# 验证 MongoDB
docker exec funfact-mongodb mongosh -u admin -p admin --eval "use funfact; db.getCollectionNames()"

# 验证 Redis
docker exec funfact-redis redis-cli dbsize
```

### 4. 上传文件同步（如用户上传的图片）

```bash
# 本地打包上传文件目录
# 假设上传文件在 server/uploads 目录
cd /Users/feynman/Documents/code/2026/@IDEA/FunFact/server
tar -czf uploads.tar.gz uploads/

# 上传到服务器
scp uploads.tar.gz root@159.75.167.99:/home/funfact-server/FunFact/server/

# 服务器解压
ssh root@159.75.167.99
cd /home/funfact-server/FunFact/server
tar -xzf uploads.tar.gz
```

### 5. 完整同步脚本

创建本地同步脚本 `scripts/sync-to-server.sh`：

```bash
#!/bin/bash

# ================================================================
# 同步本地数据到云服务器
# ================================================================

SERVER="root@159.75.167.99"
REMOTE_DIR="/home/funfact-server/FunFact"
LOCAL_DIR="/Users/feynman/Documents/code/2026/@IDEA/FunFact"

echo "=========================================="
echo "开始同步数据到云服务器"
echo "=========================================="

# 1. 同步代码
echo "[1/4] 同步代码..."
cd $LOCAL_DIR
git push production main

# 2. 同步环境变量
echo "[2/4] 同步环境变量..."
scp .env.production $SERVER:$REMOTE_DIR/

# 3. 同步数据库（可选，取消注释使用）
# echo "[3/4] 同步数据库..."
# docker exec local-postgres pg_dump -U postgres funfact | ssh $SERVER "docker exec -i funfact-postgres psql -U postgres funfact"

# 4. 同步上传文件（可选，取消注释使用）
# echo "[4/4] 同步上传文件..."
# rsync -avz --progress $LOCAL_DIR/server/uploads/ $SERVER:$REMOTE_DIR/server/uploads/

# 5. 重新部署
echo "[3/4] 重新部署..."
ssh $SERVER "cd $REMOTE_DIR && docker compose -f docker-compose.prod.yml up -d --build"

# 6. 运行数据库迁移
echo "[4/4] 运行数据库迁移..."
ssh $SERVER "docker exec funfact-server npm run migration:run"

echo "=========================================="
echo "同步完成！"
echo "=========================================="
```

```bash
# 添加执行权限
chmod +x scripts/sync-to-server.sh

# 执行同步
./scripts/sync-to-server.sh
```

### 6. 使用 rsync 增量同步（大文件推荐）

```bash
# 同步整个项目（排除 node_modules 等）
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude 'dist' \
  --exclude '.env' \
  /Users/feynman/Documents/code/2026/@IDEA/FunFact/ \
  root@159.75.167.99:/home/funfact-server/FunFact/

# 只同步上传文件
rsync -avz --progress \
  /Users/feynman/Documents/code/2026/@IDEA/FunFact/server/uploads/ \
  root@159.75.167.99:/home/funfact-server/FunFact/server/uploads/
```

### 7. SSH 免密登录配置

```bash
# 本地生成 SSH 密钥（如果没有）
ssh-keygen -t ed25519 -C "funfact-deploy"

# 复制公钥到服务器
ssh-copy-id -i ~/.ssh/id_ed25519.pub root@159.75.167.99

# 测试免密登录
ssh root@159.75.167.99
```

> 💡 **提示**：配置免密登录后，上述所有 scp/ssh 命令都不需要再输入密码。

---

## 启动服务

### 1. 构建并启动

```bash
cd /home/funfact-server/FunFact

# 构建并启动所有服务
docker compose -f docker-compose.prod.yml --env-file .env.production up -d --build

# 查看服务状态
docker compose -f docker-compose.prod.yml ps
```

### 2. 初始化数据库

```bash
# 等待所有服务启动完成（约 30 秒）
sleep 30

# 进入 server 容器
docker exec -it funfact-server sh

# 运行数据库迁移
npm run migration:run

# 导入种子数据
npm run seed

# 退出容器
exit
```

### 3. 验证部署

```bash
# 检查 API 是否正常
curl http://localhost:3000/api/health

# 检查前端是否正常
curl -I http://localhost:8080

# 检查管理后台是否正常
curl -I http://localhost:8081

# 查看日志
docker compose -f docker-compose.prod.yml logs -f
```

---

## 运维命令

### 服务管理

```bash
# 查看所有服务状态
docker compose -f docker-compose.prod.yml ps

# 启动所有服务
docker compose -f docker-compose.prod.yml up -d

# 停止所有服务
docker compose -f docker-compose.prod.yml down

# 重启所有服务
docker compose -f docker-compose.prod.yml restart

# 重启单个服务
docker compose -f docker-compose.prod.yml restart server

# 查看实时日志
docker compose -f docker-compose.prod.yml logs -f

# 查看指定服务日志
docker compose -f docker-compose.prod.yml logs -f server
```

### 更新部署

```bash
cd /home/funfact-server/FunFact

# 拉取最新代码
git pull origin main

# 重新构建并启动
docker compose -f docker-compose.prod.yml up -d --build

# 运行新的数据库迁移（如果有）
docker exec -it funfact-server npm run migration:run
```

### 数据库备份

```bash
# 备份 PostgreSQL
docker exec funfact-postgres pg_dump -U postgres funfact > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复 PostgreSQL
docker exec -i funfact-postgres psql -U postgres funfact < backup_20260608_120000.sql

# 备份 MongoDB
docker exec funfact-mongodb mongodump --archive --gzip > mongodb_backup_$(date +%Y%m%d_%H%M%S).gz

# 恢复 MongoDB
docker exec -i funfact-mongodb mongorestore --archive --gzip < mongodb_backup_20260608_120000.gz
```

### 自动备份脚本

创建 `/home/funfact-server/FunFact/scripts/backup.sh`：

```bash
#!/bin/bash

BACKUP_DIR="/home/funfact-server/FunFact/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# 备份 PostgreSQL
docker exec funfact-postgres pg_dump -U postgres funfact | gzip > $BACKUP_DIR/postgres_$DATE.sql.gz

# 备份 MongoDB
docker exec funfact-mongodb mongodump --archive --gzip > $BACKUP_DIR/mongodb_$DATE.gz

# 删除 7 天前的备份
find $BACKUP_DIR -type f -mtime +7 -delete

echo "Backup completed: $DATE"
```

```bash
# 添加执行权限
chmod +x /home/funfact-server/FunFact/scripts/backup.sh

# 添加定时任务（每天凌晨 3 点备份）
crontab -e
0 3 * * * /home/funfact-server/FunFact/scripts/backup.sh >> /var/log/funfact-backup.log 2>&1
```

### 进入容器调试

```bash
# 进入 server 容器
docker exec -it funfact-server sh

# 进入 PostgreSQL
docker exec -it funfact-postgres psql -U postgres funfact

# 进入 Redis
docker exec -it funfact-redis redis-cli -a your_redis_password

# 进入 MongoDB
docker exec -it funfact-mongodb mongosh -u admin -p your_mongo_password
```

---

## 常见问题

### 1. Elasticsearch 启动失败

**问题**：Elasticsearch 无法启动，日志显示内存不足。

**解决**：调整 ES 内存配置，在 `docker-compose.prod.yml` 中修改：

```yaml
elasticsearch:
  environment:
    - ES_JAVA_OPTS=-Xms256m -Xmx256m
```

### 2. 数据库连接失败

**问题**：server 无法连接到 PostgreSQL。

**解决**：
1. 检查 PostgreSQL 是否已启动：`docker compose ps`
2. 检查环境变量是否正确
3. 等待 PostgreSQL 健康检查通过

### 3. Nginx 502 Bad Gateway

**问题**：访问网站返回 502 错误。

**解决**：
1. 检查后端服务是否运行：`docker compose ps`
2. 检查端口映射是否正确
3. 查看 Nginx 错误日志：`sudo tail -f /var/log/nginx/error.log`

### 4. 容器自动重启

**问题**：容器不断重启。

**解决**：
```bash
# 查看容器日志
docker compose -f docker-compose.prod.yml logs server

# 检查资源使用
docker stats
```

### 5. 磁盘空间不足

**问题**：Docker 占用过多磁盘空间。

**解决**：
```bash
# 清理未使用的镜像
docker image prune -a

# 清理未使用的容器
docker container prune

# 清理未使用的卷
docker volume prune

# 清理所有未使用资源
docker system prune -a --volumes
```

---

## 端口映射说明

| 服务 | 容器端口 | 主机端口 | 访问方式 |
|------|----------|----------|----------|
| app/ | 80 | 8080 | Nginx 代理 (`http://ip/`) |
| manage/ | 80 | 8081 | Nginx 代理 (`http://ip/manage`) 或直接 `http://ip:8081` |
| server/ | 3000 | 3000 | Nginx 代理 (`http://ip/api`) |
| PostgreSQL | 5432 | - | Docker 内部 |
| Redis | 6379 | - | Docker 内部 |
| MongoDB | 27017 | - | Docker 内部 |
| Elasticsearch | 9200 | - | Docker 内部 |

> 💡 基础设施服务仅通过 Docker 内部网络访问，不暴露到主机，提高安全性。

---

## 部署检查清单（测试环境）

- [ ] 服务器环境准备（Docker、Nginx）
- [ ] 配置环境变量（.env.production）
- [ ] 创建 app/ 和 manage/ 的 Dockerfile 和 nginx.conf
- [ ] 创建 docker-compose.prod.yml
- [ ] 配置 Nginx 反向代理（HTTP）
- [ ] 启动所有服务
- [ ] 初始化数据库（migration + seed）
- [ ] 测试 API 接口
- [ ] 测试前端页面
- [ ] 测试管理后台

---

## TODO - 生产环境部署

> 以下内容为生产环境部署的待办事项，测试环境验证通过后再实施。

### 1. SSL/HTTPS 配置

- [ ] 注册域名并解析到服务器
- [ ] 安装 Certbot：`sudo apt install certbot python3-certbot-nginx -y`
- [ ] 申请 SSL 证书：`sudo certbot --nginx -d your-domain.com`
- [ ] 配置自动续期：`0 2 * * * /usr/bin/certbot renew --quiet --post-hook "systemctl reload nginx"`
- [ ] 更新 Nginx 配置启用 HTTPS

### 2. 安全加固

- [ ] 配置防火墙（UFW）
  ```bash
  sudo ufw allow 22/tcp
  sudo ufw allow 80/tcp
  sudo ufw allow 443/tcp
  sudo ufw enable
  ```
- [ ] 修改所有服务默认密码
- [ ] 限制管理后台 IP 白名单
- [ ] 关闭不必要的端口
- [ ] 配置 fail2ban 防暴力破解

### 3. CI/CD 自动部署

- [ ] 创建 GitHub Actions workflow
  ```yaml
  name: Deploy
  on:
    push:
      branches: [main]
  jobs:
    deploy:
      runs-on: ubuntu-latest
      steps:
        - uses: actions/checkout@v4
        - uses: appleboy/ssh-action@v1
          with:
            host: ${{ secrets.SERVER_HOST }}
            username: ${{ secrets.SERVER_USER }}
            key: ${{ secrets.SSH_PRIVATE_KEY }}
            script: |
              cd /home/funfact-server/FunFact
              git pull
              docker compose -f docker-compose.prod.yml up -d --build
  ```
- [ ] 配置 GitHub Secrets

### 4. 监控与日志

- [ ] 配置日志收集（如 Loki + Grafana）
- [ ] 设置服务健康检查告警
- [ ] 配置错误追踪（如 Sentry）

### 5. 性能优化

- [ ] 配置 CDN 加速静态资源
- [ ] 优化 Docker 镜像大小
- [ ] 配置数据库连接池
- [ ] 配置 Redis 缓存策略

### 6. 备份策略

- [ ] 配置自动备份脚本
- [ ] 设置异地备份
- [ ] 定期测试恢复流程

---

*最后更新：2026-06-08*
