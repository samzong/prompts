#!/bin/bash

# 版本发布脚本
# 使用方法：./scripts/release.sh [版本号] [发布类型]
# 示例：./scripts/release.sh 0.2.0 minor

set -e

# 颜色配置
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 获取当前版本
CURRENT_VERSION=$(grep '"version"' package.json | head -1 | awk -F: '{ print $2 }' | sed 's/[", ]//g')

# 参数处理
NEW_VERSION=$1
RELEASE_TYPE=$2

if [ -z "$NEW_VERSION" ]; then
    echo -e "${RED}错误: 请提供新版本号${NC}"
    echo "使用方法: ./scripts/release.sh [版本号] [发布类型]"
    echo "示例: ./scripts/release.sh 0.2.0 minor"
    exit 1
fi

if [ -z "$RELEASE_TYPE" ]; then
    RELEASE_TYPE="patch"
fi

echo -e "${BLUE}🚀 开始发布流程...${NC}"
echo -e "${YELLOW}当前版本: $CURRENT_VERSION${NC}"
echo -e "${YELLOW}目标版本: $NEW_VERSION${NC}"
echo -e "${YELLOW}发布类型: $RELEASE_TYPE${NC}"

# 确认操作
read -p "确认要发布新版本吗？(y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}发布已取消${NC}"
    exit 1
fi

# 检查工作目录是否干净
if [[ -n $(git status -s) ]]; then
    echo -e "${RED}错误: 工作目录不干净，请先提交或暂存所有更改${NC}"
    git status -s
    exit 1
fi

# 检查是否在主分支
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" && "$CURRENT_BRANCH" != "master" ]]; then
    echo -e "${RED}警告: 当前不在主分支 ($CURRENT_BRANCH)${NC}"
    read -p "继续发布吗？(y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}发布已取消${NC}"
        exit 1
    fi
fi

echo -e "${BLUE}📝 更新版本号...${NC}"

# 更新 package.json
sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json

# 更新 src-tauri/Cargo.toml
sed -i '' "s/version = \"$CURRENT_VERSION\"/version = \"$NEW_VERSION\"/" src-tauri/Cargo.toml

# 更新 src-tauri/tauri.conf.json
sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" src-tauri/tauri.conf.json

# 更新 Makefile 中的版本
sed -i '' "s/VERSION := $CURRENT_VERSION/VERSION := $NEW_VERSION/" Makefile

echo -e "${GREEN}✅ 版本号已更新到 $NEW_VERSION${NC}"

# 运行测试（如果有的话）
if npm run test --silent 2>/dev/null; then
    echo -e "${GREEN}✅ 测试通过${NC}"
else
    echo -e "${YELLOW}⚠️  没有找到测试或测试跳过${NC}"
fi

# 构建项目进行验证
echo -e "${BLUE}🔨 构建项目验证...${NC}"
if make build-app; then
    echo -e "${GREEN}✅ 构建成功${NC}"
else
    echo -e "${RED}❌ 构建失败，发布已终止${NC}"
    exit 1
fi

# 提交更改
echo -e "${BLUE}📦 提交版本更改...${NC}"
git add package.json src-tauri/Cargo.toml src-tauri/tauri.conf.json Makefile
git commit -m "chore: bump version to $NEW_VERSION"

# 创建标签
echo -e "${BLUE}🏷️  创建 Git 标签...${NC}"
git tag -a "v$NEW_VERSION" -m "Release version $NEW_VERSION"

echo -e "${GREEN}🎉 版本发布准备完成！${NC}"
echo -e "${YELLOW}下一步操作：${NC}"
echo "1. 推送到远程仓库: git push origin main --tags"
echo "2. 构建发布包: make release"
echo "3. 在 GitHub 创建 Release"

# 询问是否自动推送
read -p "现在推送到远程仓库吗？(y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}📤 推送到远程仓库...${NC}"
    git push origin $CURRENT_BRANCH --tags
    echo -e "${GREEN}✅ 已推送到远程仓库${NC}"
fi

echo -e "${GREEN}🚀 发布流程完成！${NC}" 