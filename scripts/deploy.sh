#!/bin/bash

# ============================================
# 冷知识星球 - 本地构建 + 部署脚本
# ============================================
# 使用方法: ./scripts/deploy.sh [all|app|manage|server|db]
# ============================================

set -e

# 配置
SERVER="root@159.75.167.99"
SERVER_PATH="/data/fun-knowledge"
PROJECT_ROOT="$(cd "$(dirname "$0")/.." && pwd)"

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log_info() { echo -e "${GREEN}[INFO]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# ============================================
# 构建函数
# ============================================

build_app() {
    log_info "构建 app/ ..."
    cd "$PROJECT_ROOT/app"
    pnpm install --frozen-lockfile
    pnpm build
    log_info "app/ 构建完成 ✓"
}

build_manage() {
    log_info "构建 manage/ ..."
    cd "$PROJECT_ROOT/manage"
    pnpm install --frozen-lockfile
    pnpm prepare
    pnpm build
    log_info "manage/ 构建完成 ✓"
}

build_server() {
    log_info "构建 server Docker 镜像 ..."
    cd "$PROJECT_ROOT"
    docker build -t funfact-server ./server
    docker save funfact-server > /tmp/funfact-server.tar
    log_info "server 镜像构建完成 ✓"
}

# ============================================
# 部署函数
# ============================================

deploy_app() {
    log_info "上传 app/ 到服务器 ..."
    rsync -avz --progress --delete \
        "$PROJECT_ROOT/app/dist/" \
        "$SERVER:$SERVER_PATH/app/dist/"
    log_info "app/ 部署完成 ✓"
}

deploy_manage() {
    log_info "上传 manage/ 到服务器 ..."
    rsync -avz --progress --delete \
        "$PROJECT_ROOT/manage/dist/" \
        "$SERVER:$SERVER_PATH/manage/dist/"
    log_info "manage/ 部署完成 ✓"
}

deploy_server() {
    log_info "上传 server 镜像到服务器 ..."
    scp /tmp/funfact-server.tar "$SERVER:/tmp/"

    log_info "重启 server 服务 ..."
    ssh "$SERVER" << 'EOF'
        cd /data/fun-knowledge

        # 加载镜像
        docker load < /tmp/funfact-server.tar

        # 停止旧容器
        docker stop funfact-server 2>/dev/null || true
        docker rm funfact-server 2>/dev/null || true

        # 启动新容器
        docker run -d \
            --name funfact-server \
            --restart unless-stopped \
            --network funfact-network \
            -p 127.0.0.1:3000:3000 \
            --env-file .env.production \
            funfact-server

        # 清理
        rm -f /tmp/funfact-server.tar

        # 重载 Nginx
        systemctl reload nginx
EOF
    log_info "server 部署完成 ✓"
}

deploy_db() {
    log_info "导出本地数据库 ..."
    mkdir -p "$PROJECT_ROOT/tmp"

    # PostgreSQL
    docker exec funfact-postgres pg_dump -U postgres funfact > "$PROJECT_ROOT/tmp/postgres.sql"

    # MongoDB
    docker exec funfact-mongodb mongodump --username admin --password admin \
        --authenticationDatabase admin --archive --gzip > "$PROJECT_ROOT/tmp/mongodb.gz"

    # Redis
    docker exec funfact-redis redis-cli save
    docker cp funfact-redis:/data/dump.rdb "$PROJECT_ROOT/tmp/redis.rdb"

    log_info "上传数据库备份到服务器 ..."
    scp "$PROJECT_ROOT/tmp/postgres.sql" "$SERVER:$SERVER_PATH/"
    scp "$PROJECT_ROOT/tmp/mongodb.gz" "$SERVER:$SERVER_PATH/"
    scp "$PROJECT_ROOT/tmp/redis.rdb" "$SERVER:$SERVER_PATH/"

    log_info "导入数据库 ..."
    ssh "$SERVER" << 'EOF'
        cd /data/fun-knowledge

        # 导入 PostgreSQL
        docker exec -i funfact-postgres psql -U postgres funfact < postgres.sql

        # 导入 MongoDB
        docker exec -i funfact-mongodb mongorestore \
            --username admin --password admin \
            --authenticationDatabase admin \
            --archive --gzip < mongodb.gz

        # 导入 Redis
        docker stop funfact-redis
        docker cp redis.rdb funfact-redis:/data/dump.rdb
        docker start funfact-redis

        # 清理备份文件
        rm -f postgres.sql mongodb.gz redis.rdb
EOF
    log_info "数据库同步完成 ✓"
}

# ============================================
# 主函数
# ============================================

show_help() {
    echo "用法: ./scripts/deploy.sh [命令]"
    echo ""
    echo "命令:"
    echo "  all       构建并部署所有组件"
    echo "  app       构建并部署前端应用"
    echo "  manage    构建并部署管理后台"
    echo "  server    构建并部署后端服务"
    echo "  db        同步数据库到服务器"
    echo "  build     仅构建，不部署"
    echo "  help      显示帮助信息"
}

case "${1:-help}" in
    all)
        build_app
        build_manage
        build_server
        deploy_app
        deploy_manage
        deploy_server
        log_info "全部部署完成！"
        ;;
    app)
        build_app
        deploy_app
        ;;
    manage)
        build_manage
        deploy_manage
        ;;
    server)
        build_server
        deploy_server
        ;;
    db)
        deploy_db
        ;;
    build)
        build_app
        build_manage
        build_server
        log_info "构建完成！镜像已保存到 /tmp/funfact-server.tar"
        ;;
    help|*)
        show_help
        ;;
esac
