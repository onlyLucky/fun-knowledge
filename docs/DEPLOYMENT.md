# 冷知识星球 - 部署指南

## 架构

```
┌─────────────────────────────────────────────────────────┐
│                  Nginx (:80)                             │
│   /        → app/dist (静态文件)                         │
│   /manage  → manage/dist (静态文件)                      │
│   /api     → proxy http://localhost:3000                 │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│                  Docker 容器                             │
│   server (:3000) | PostgreSQL | Redis | MongoDB | ES    │
└─────────────────────────────────────────────────────────┘
```

## 快速部署

### 1. 服务器初始化（一次性）

```bash
ssh root@159.75.167.99

# 安装 Nginx
apt update && apt install nginx -y
systemctl enable nginx

# 创建项目目录
mkdir -p /data/fun-knowledge
```

### 2. 配置环境变量

```bash
# 上传 .env.production 到服务器
scp .env.production root@159.75.167.99:/data/fun-knowledge/
```

### 3. 启动基础设施

```bash
ssh root@159.75.167.99
cd /data/fun-knowledge

# 创建 docker-compose.yml（基础设施）
# 参考下方"基础设施配置"

docker compose up -d
```

### 4. 使用部署脚本

```bash
# 部署所有组件
./scripts/deploy.sh all

# 或单独部署
./scripts/deploy.sh app      # 仅部署前端
./scripts/deploy.sh manage   # 仅部署管理后台
./scripts/deploy.sh server   # 仅部署后端
./scripts/deploy.sh db       # 同步数据库
```

---

## 部署脚本说明

脚本位置：`scripts/deploy.sh`

| 命令 | 功能 |
|------|------|
| `./scripts/deploy.sh all` | 构建并部署所有组件 |
| `./scripts/deploy.sh app` | 构建并部署前端 |
| `./scripts/deploy.sh manage` | 构建并部署管理后台 |
| `./scripts/deploy.sh server` | 构建并部署后端 |
| `./scripts/deploy.sh db` | 同步本地数据库到服务器 |
| `./scripts/deploy.sh build` | 仅构建，不部署 |

---

## 服务器配置

### Nginx 配置

```bash
vi /etc/nginx/sites-available/funfact
```

```nginx
server {
    listen 80;
    server_name 159.75.167.99;

    gzip on;
    gzip_types text/plain text/css application/json application/javascript;

    # 前端
    location / {
        root /data/fun-knowledge/app/dist;
        try_files $uri $uri/ /index.html;
    }

    # 管理后台
    location /manage {
        alias /data/fun-knowledge/manage/dist;
        try_files $uri $uri/ /manage/index.html;
    }

    # API
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

```bash
ln -s /etc/nginx/sites-available/funfact /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx
```

### Docker 基础设施

`/data/fun-knowledge/docker-compose.yml`：

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:16-alpine
    container_name: funfact-postgres
    restart: unless-stopped
    environment:
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: funfact
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - funfact-network

  redis:
    image: redis:7-alpine
    container_name: funfact-redis
    restart: unless-stopped
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - funfact-network

  mongodb:
    image: mongo:7
    container_name: funfact-mongodb
    restart: unless-stopped
    environment:
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
    volumes:
      - mongodb_data:/data/db
    networks:
      - funfact-network

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

volumes:
  postgres_data:
  redis_data:
  mongodb_data:
  elasticsearch_data:

networks:
  funfact-network:
    driver: bridge
```

`.env` 文件：

```bash
POSTGRES_PASSWORD=your_password
REDIS_PASSWORD=your_password
MONGO_PASSWORD=your_password
```

---

## 访问地址

| 服务 | 地址 |
|------|------|
| 前端 | http://159.75.167.99 |
| 管理后台 | http://159.75.167.99/manage |
| API | http://159.75.167.99/api |

---

## 常用命令

```bash
# 查看服务状态
ssh root@159.75.167.99 "docker ps"

# 查看日志
ssh root@159.75.167.99 "docker logs -f funfact-server"

# 重启后端
ssh root@159.75.167.99 "docker restart funfact-server"
```
