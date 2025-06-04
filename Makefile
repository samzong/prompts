# 项目名称和版本
PROJECT_NAME := prompts
VERSION := 0.1.0

# 颜色配置
RED := \033[31m
GREEN := \033[32m
YELLOW := \033[33m
BLUE := \033[34m
MAGENTA := \033[35m
CYAN := \033[36m
WHITE := \033[37m
RESET := \033[0m

# 平台检测
UNAME_S := $(shell uname -s)
UNAME_M := $(shell uname -m)

# 构建目标平台
ifeq ($(UNAME_S),Linux)
    PLATFORM := linux
endif
ifeq ($(UNAME_S),Darwin)
    PLATFORM := macos
endif
ifeq ($(UNAME_S),Windows_NT)
    PLATFORM := windows
endif

# 默认目标
.DEFAULT_GOAL := help

# 帮助信息
.PHONY: help
help: ## 显示帮助信息
	@echo "$(CYAN)$(PROJECT_NAME) v$(VERSION)$(RESET)"
	@echo "$(YELLOW)可用命令:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-20s$(RESET) %s\n", $$1, $$2}'

# 开发环境
.PHONY: install
install: ## 安装项目依赖
	@echo "$(BLUE)安装前端依赖...$(RESET)"
	npm install
	@echo "$(BLUE)安装 Rust 依赖...$(RESET)"
	cd src-tauri && cargo build --release
	@echo "$(GREEN)✅ 依赖安装完成$(RESET)"

.PHONY: dev
dev: ## 启动开发服务器
	@echo "$(BLUE)启动开发环境...$(RESET)"
	npm run tauri dev

.PHONY: dev-web
dev-web: ## 仅启动前端开发服务器
	@echo "$(BLUE)启动前端开发服务器...$(RESET)"
	npm run dev

# 构建
.PHONY: build
build: ## 构建项目
	@echo "$(BLUE)构建前端...$(RESET)"
	npm run build
	@echo "$(GREEN)✅ 前端构建完成$(RESET)"

.PHONY: build-app
build-app: build ## 构建 Tauri 应用
	@echo "$(BLUE)构建 Tauri 应用...$(RESET)"
	npm run tauri build
	@echo "$(GREEN)✅ 应用构建完成$(RESET)"

# 多平台构建
.PHONY: build-all
build-all: ## 构建所有平台的安装包
	@echo "$(BLUE)开始构建所有平台...$(RESET)"
	$(MAKE) build-linux
	$(MAKE) build-macos
	$(MAKE) build-windows
	@echo "$(GREEN)✅ 所有平台构建完成$(RESET)"

.PHONY: build-linux
build-linux: ## 构建 Linux 平台安装包
	@echo "$(BLUE)构建 Linux 平台...$(RESET)"
	npm run tauri build -- --target x86_64-unknown-linux-gnu
	@echo "$(GREEN)✅ Linux 构建完成$(RESET)"

.PHONY: build-macos
build-macos: ## 构建 macOS 平台安装包
	@echo "$(BLUE)构建 macOS 平台...$(RESET)"
	npm run tauri build -- --target aarch64-apple-darwin
	npm run tauri build -- --target x86_64-apple-darwin
	@echo "$(GREEN)✅ macOS 构建完成$(RESET)"

.PHONY: build-windows
build-windows: ## 构建 Windows 平台安装包
	@echo "$(BLUE)构建 Windows 平台...$(RESET)"
	npm run tauri build -- --target x86_64-pc-windows-msvc
	@echo "$(GREEN)✅ Windows 构建完成$(RESET)"

# 清理
.PHONY: clean
clean: ## 清理构建文件
	@echo "$(BLUE)清理构建文件...$(RESET)"
	rm -rf dist
	rm -rf src-tauri/target
	rm -rf node_modules/.vite
	@echo "$(GREEN)✅ 清理完成$(RESET)"

.PHONY: clean-all
clean-all: clean ## 清理所有文件（包括依赖）
	@echo "$(BLUE)清理所有文件...$(RESET)"
	rm -rf node_modules
	cd src-tauri && cargo clean
	@echo "$(GREEN)✅ 完全清理完成$(RESET)"

# 工具
.PHONY: setup-targets
setup-targets: ## 安装跨平台编译目标
	@echo "$(BLUE)安装跨平台编译目标...$(RESET)"
	rustup target add x86_64-unknown-linux-gnu
	rustup target add x86_64-pc-windows-msvc
	rustup target add aarch64-apple-darwin
	@echo "$(GREEN)✅ 编译目标安装完成$(RESET)"

.PHONY: update
update: ## 更新依赖
	@echo "$(BLUE)更新前端依赖...$(RESET)"
	npm update
	@echo "$(BLUE)更新 Rust 依赖...$(RESET)"
	cd src-tauri && cargo update
	@echo "$(GREEN)✅ 依赖更新完成$(RESET)"

.PHONY: info
info: ## 显示项目信息
	@echo "$(CYAN)项目信息:$(RESET)"
	@echo "  项目名称: $(PROJECT_NAME)"
	@echo "  版本: $(VERSION)"
	@echo "  平台: $(PLATFORM)"
	@echo "  Node.js 版本: $(shell node --version)"
	@echo "  npm 版本: $(shell npm --version)"
	@echo "  Rust 版本: $(shell rustc --version)"
	@echo "  Tauri CLI 版本: $(shell npm run tauri -- --version 2>/dev/null | head -1)"

.PHONY: doctor
doctor: ## 检查开发环境
	@echo "$(BLUE)检查开发环境...$(RESET)"
	@echo "Node.js: $(shell node --version || echo '$(RED)未安装$(RESET)')"
	@echo "npm: $(shell npm --version || echo '$(RED)未安装$(RESET)')"
	@echo "Rust: $(shell rustc --version || echo '$(RED)未安装$(RESET)')"
	@echo "Cargo: $(shell cargo --version || echo '$(RED)未安装$(RESET)')"
	@echo "Tauri CLI: $(shell npm run tauri -- --version 2>/dev/null | head -1 || echo '$(RED)未安装$(RESET)')"

# 打包分发
.PHONY: package
package: build-app ## 创建分发包
	@echo "$(BLUE)创建分发包...$(RESET)"
	mkdir -p dist/$(VERSION)
	cp -r src-tauri/target/release/bundle/* dist/$(VERSION)/
	@echo "$(GREEN)✅ 分发包创建完成: dist/$(VERSION)/$(RESET)"

# 开发工具
.PHONY: tauri-info
tauri-info: ## 显示 Tauri 信息
	npm run tauri info

.PHONY: tauri-icon
tauri-icon: ## 生成应用图标（需要 icon.png 文件）
	npm run tauri icon

# 快速命令
.PHONY: quick-dev
quick-dev: install dev ## 快速开始开发（安装依赖+启动开发）

.PHONY: quick-build
quick-build: clean build-app ## 快速构建（清理+构建）

.PHONY: quick-release
quick-release: clean-all install release ## 快速发布（完全清理+安装+发布） 