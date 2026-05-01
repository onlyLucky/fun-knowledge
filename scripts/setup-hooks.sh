#!/bin/bash

# Git Hooks 安装脚本
# 冷知识星球 - 开发规范配置

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔧 安装 Git Hooks...${NC}"
echo ""

# 检查是否在 Git 仓库中
if [ ! -d ".git" ]; then
    echo -e "${RED}❌ 错误: 当前目录不是 Git 仓库${NC}"
    exit 1
fi

# 创建 hooks 目录（如果不存在）
mkdir -p .git/hooks

# 复制 pre-commit hook
if [ -f ".git/hooks/pre-commit" ]; then
    echo -e "${YELLOW}⚠️  pre-commit hook 已存在${NC}"
    read -p "是否覆盖? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}跳过 pre-commit hook 安装${NC}"
    else
        cp .git/hooks/pre-commit .git/hooks/pre-commit.bak
        echo -e "${GREEN}✅ 已备份原 pre-commit hook${NC}"
    fi
fi

# 检查 jq 是否安装
if ! command -v jq &> /dev/null; then
    echo -e "${YELLOW}⚠️  警告: jq 未安装${NC}"
    echo -e "${YELLOW}   请安装 jq 以支持配置文件解析${NC}"
    echo -e "${YELLOW}   macOS: brew install jq${NC}"
    echo -e "${YELLOW}   Ubuntu: sudo apt-get install jq${NC}"
    echo ""
fi

# 设置执行权限
chmod +x .git/hooks/pre-commit

echo -e "${GREEN}✅ Git Hooks 安装完成${NC}"
echo ""
echo -e "${GREEN}📋 已安装的 Hooks:${NC}"
echo -e "   - pre-commit: 提交前检查开发任务和日志"
echo ""
echo -e "${GREEN}📝 使用说明:${NC}"
echo -e "   1. 每次执行 git commit 时会自动检查"
echo -e "   2. 检查内容包括:"
echo -e "      - 开发任务状态是否更新"
echo -e "      - 开发日志是否已记录"
echo -e "      - 提交信息是否包含任务 ID"
echo -e "      - 版本号是否一致"
echo ""
echo -e "${GREEN}⚙️  配置文件:${NC}"
echo -e "   - .commit-check.config.json: 检查规则配置"
echo -e "   - docs/TASK.md: 开发任务清单"
echo -e "   - docs/DEVLOG.md: 开发日志"
echo ""
echo -e "${GREEN}🎯 开始开发吧！${NC}"
