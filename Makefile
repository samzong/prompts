# 项目名称和版本
PROJECT_NAME := prompts
VERSION := 0.1.4

# Homebrew 相关变量
HOMEBREW_TAP_REPO = homebrew-tap
CASK_FILE = Casks/prompts.rb
BRANCH_NAME = update-prompts-$(shell echo $(VERSION) | sed 's/v//')
CLEAN_VERSION = $(shell echo $(VERSION) | sed 's/v//')

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
    # 检测当前 macOS 架构
    ifeq ($(UNAME_M),arm64)
        CURRENT_DARWIN_TARGET := aarch64-apple-darwin
        CURRENT_ARCH := ARM64
    else
        CURRENT_DARWIN_TARGET := x86_64-apple-darwin
        CURRENT_ARCH := Intel
    endif
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
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  $(GREEN)%-22s$(RESET) %s\n", $$1, $$2}'

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

# 多平台构建
.PHONY: build-all
build-all: ## 构建所有支持的平台 (macOS M1, Intel, Windows)
	@echo "$(BLUE)构建所有支持平台...$(RESET)"
	$(MAKE) build-macos-arm64
	$(MAKE) build-macos-intel  
	$(MAKE) build-windows
	@echo "$(GREEN)✅ 所有平台构建完成$(RESET)"

.PHONY: build-macos-arm64
build-macos-arm64: ## 构建 macOS ARM64 (Apple Silicon/M1)
	@echo "$(BLUE)构建 macOS ARM64 (Apple Silicon)...$(RESET)"
	npm run tauri build -- --target aarch64-apple-darwin
	@echo "$(GREEN)✅ macOS ARM64 构建完成$(RESET)"

.PHONY: build-macos-intel
build-macos-intel: ## 构建 macOS x86_64 (Intel)
	@echo "$(BLUE)构建 macOS x86_64 (Intel)...$(RESET)"
	npm run tauri build -- --target x86_64-apple-darwin
	@echo "$(GREEN)✅ macOS Intel 构建完成$(RESET)"

.PHONY: build-windows
build-windows: setup-windows-cross ## 构建 Windows 平台安装包
	@echo "$(BLUE)构建 Windows 平台...$(RESET)"
	npm run tauri build -- --target x86_64-pc-windows-msvc
	@echo "$(GREEN)✅ Windows 构建完成$(RESET)"

.PHONY: build
build: ## 构建当前系统架构
ifeq ($(PLATFORM),macos)
	@echo "$(BLUE)构建当前 macOS 平台 ($(CURRENT_ARCH))...$(RESET)"
	npm run tauri build -- --target $(CURRENT_DARWIN_TARGET)
	@echo "$(GREEN)✅ macOS $(CURRENT_ARCH) 构建完成$(RESET)"
else
	@echo "$(RED)错误: 当前平台 $(PLATFORM) 不支持构建$(RESET)"
	@exit 1
endif

# 清理
.PHONY: clean
clean: ## 清理构建文件
	@echo "$(BLUE)清理构建文件...$(RESET)"
	rm -rf dist
	rm -rf src-tauri/target
	rm -rf node_modules/.vite
	@echo "$(GREEN)✅ 清理完成$(RESET)"

.PHONY: clean-all
clean-all: clean ## 清理所有文件（包括交叉编译环境）
	@echo "$(BLUE)清理交叉编译环境...$(RESET)"
	rm -rf .cargo/config.toml
	rm -rf $(HOME)/.xwin
	@echo "$(GREEN)✅ 完全清理完成$(RESET)"

# 工具
.PHONY: setup-targets
setup-targets: ## 安装跨平台编译目标
	@echo "$(BLUE)安装跨平台编译目标...$(RESET)"
	rustup target add x86_64-pc-windows-msvc
	rustup target add aarch64-apple-darwin
	rustup target add x86_64-apple-darwin
	@echo "$(GREEN)✅ 编译目标安装完成$(RESET)"

# Windows 交叉编译设置
XWIN_DIR := $(HOME)/.xwin
CARGO_CONFIG_FILE := .cargo/config.toml

.PHONY: check-xwin
check-xwin:
	@if ! command -v xwin >/dev/null 2>&1; then \
		echo "$(YELLOW)xwin 未安装，正在安装...$(RESET)"; \
		cargo install xwin; \
	fi

.PHONY: setup-xwin-sdk
setup-xwin-sdk: check-xwin
	@if [ ! -d "$(XWIN_DIR)" ]; then \
		echo "$(YELLOW)Windows SDK 未下载，正在下载到 $(XWIN_DIR)...$(RESET)"; \
		mkdir -p $(XWIN_DIR); \
		xwin --accept-license splat --output $(XWIN_DIR); \
	else \
		echo "$(GREEN)Windows SDK 已存在于 $(XWIN_DIR)$(RESET)"; \
	fi

.PHONY: setup-cargo-config
setup-cargo-config:
	@mkdir -p .cargo
	@if [ ! -f "$(CARGO_CONFIG_FILE)" ]; then \
		echo "$(YELLOW)创建 Cargo 配置文件...$(RESET)"; \
		echo '[target.x86_64-pc-windows-msvc]' > $(CARGO_CONFIG_FILE); \
		echo 'linker = "lld-link"' >> $(CARGO_CONFIG_FILE); \
		echo 'rustflags = [' >> $(CARGO_CONFIG_FILE); \
		echo '  "-Lnative=$(XWIN_DIR)/crt/lib/x86_64",' >> $(CARGO_CONFIG_FILE); \
		echo '  "-Lnative=$(XWIN_DIR)/sdk/lib/um/x86_64",' >> $(CARGO_CONFIG_FILE); \
		echo '  "-Lnative=$(XWIN_DIR)/sdk/lib/ucrt/x86_64",' >> $(CARGO_CONFIG_FILE); \
		echo ']' >> $(CARGO_CONFIG_FILE); \
		echo '' >> $(CARGO_CONFIG_FILE); \
		echo '[env]' >> $(CARGO_CONFIG_FILE); \
		echo 'CC_x86_64_pc_windows_msvc = "clang-cl --target=x86_64-pc-windows-msvc"' >> $(CARGO_CONFIG_FILE); \
		echo 'CXX_x86_64_pc_windows_msvc = "clang-cl --target=x86_64-pc-windows-msvc"' >> $(CARGO_CONFIG_FILE); \
		echo 'AR_x86_64_pc_windows_msvc = "llvm-lib"' >> $(CARGO_CONFIG_FILE); \
		echo "$(GREEN)✅ Cargo 配置文件已创建$(RESET)"; \
	else \
		echo "$(GREEN)Cargo 配置文件已存在$(RESET)"; \
	fi

.PHONY: setup-windows-cross
setup-windows-cross: setup-targets setup-xwin-sdk setup-cargo-config ## 设置 Windows 交叉编译环境
	@echo "$(GREEN)✅ Windows 交叉编译环境配置完成$(RESET)"

.PHONY: update
update: ## 更新依赖
	@echo "$(BLUE)更新前端依赖...$(RESET)"
	npm update
	@echo "$(BLUE)更新 Rust 依赖...$(RESET)"
	cd src-tauri && cargo update
	@echo "$(GREEN)✅ 依赖更新完成$(RESET)"

.PHONY: doctor
doctor: ## 检查开发环境
	@echo "$(BLUE)检查开发环境...$(RESET)"
	@echo "Node.js: $(shell node --version || echo '$(RED)未安装$(RESET)')"
	@echo "npm: $(shell npm --version || echo '$(RED)未安装$(RESET)')"
	@echo "Rust: $(shell rustc --version || echo '$(RED)未安装$(RESET)')"
	@echo "Cargo: $(shell cargo --version || echo '$(RED)未安装$(RESET)')"
	@echo "Tauri CLI: $(shell npm run tauri -- --version 2>/dev/null | head -1 || echo '$(RED)未安装$(RESET)')"

.PHONY: info
info: ## 显示详细项目和环境信息
	@echo "$(CYAN)项目信息:$(RESET)"
	@echo "  项目名称: $(PROJECT_NAME)"
	@echo "  版本: $(VERSION)"
	@echo "  平台: $(PLATFORM)"
	@echo ""
	npm run tauri info

.PHONY: icon
icon: ## 生成应用图标（需要 icon.png 文件）
	npm run tauri icon

# 版本发布
.PHONY: release
release: ## 发布新版本 (usage: make release VERSION=x.x.x)
	@if [ -z "$(VERSION)" ]; then \
		echo "$(RED)错误: 请指定版本号$(RESET)"; \
		echo "使用方法: make release VERSION=x.x.x"; \
		exit 1; \
	fi
	@echo "$(BLUE)发布版本 $(VERSION)...$(RESET)"
	./scripts/release.sh $(VERSION)

.PHONY: release-patch
release-patch: ## 发布补丁版本 (0.1.0 -> 0.1.1)
	@CURRENT_VERSION=$$(grep '"version"' package.json | head -1 | awk -F: '{ print $$2 }' | sed 's/[", ]//g'); \
	PATCH_VERSION=$$(echo $$CURRENT_VERSION | awk -F. '{print $$1"."$$2"."($$3+1)}'); \
	echo "$(BLUE)发布补丁版本: $$CURRENT_VERSION -> $$PATCH_VERSION$(RESET)"; \
	./scripts/release.sh $$PATCH_VERSION patch

.PHONY: release-minor
release-minor: ## 发布次要版本 (0.1.0 -> 0.2.0)
	@CURRENT_VERSION=$$(grep '"version"' package.json | head -1 | awk -F: '{ print $$2 }' | sed 's/[", ]//g'); \
	MINOR_VERSION=$$(echo $$CURRENT_VERSION | awk -F. '{print $$1"."($$2+1)".0"}'); \
	echo "$(BLUE)发布次要版本: $$CURRENT_VERSION -> $$MINOR_VERSION$(RESET)"; \
	./scripts/release.sh $$MINOR_VERSION minor

.PHONY: release-major
release-major: ## 发布主要版本 (0.1.0 -> 1.0.0)
	@CURRENT_VERSION=$$(grep '"version"' package.json | head -1 | awk -F: '{ print $$2 }' | sed 's/[", ]//g'); \
	MAJOR_VERSION=$$(echo $$CURRENT_VERSION | awk -F. '{print ($$1+1)".0.0"}'); \
	echo "$(BLUE)发布主要版本: $$CURRENT_VERSION -> $$MAJOR_VERSION$(RESET)"; \
	./scripts/release.sh $$MAJOR_VERSION major

.PHONY: package
package: build-all ## 打包发布文件
	@echo "$(BLUE)打包发布文件...$(RESET)"
	mkdir -p releases/$(VERSION)
	@echo "$(BLUE)查找并复制发布文件...$(RESET)"
	-cp src-tauri/target/aarch64-apple-darwin/release/bundle/dmg/*.dmg releases/$(VERSION)/ 2>/dev/null || true
	-cp src-tauri/target/x86_64-apple-darwin/release/bundle/dmg/*.dmg releases/$(VERSION)/ 2>/dev/null || true
	-cp src-tauri/target/x86_64-pc-windows-msvc/release/bundle/nsis/*-setup.exe releases/$(VERSION)/ 2>/dev/null || true
	-cp src-tauri/target/x86_64-pc-windows-msvc/release/bundle/msi/*.msi releases/$(VERSION)/ 2>/dev/null || true
	@echo "$(BLUE)发布文件列表:$(RESET)"
	@ls -la releases/$(VERSION)/
	@echo "$(GREEN)✅ 发布包已保存到 releases/$(VERSION)/$(RESET)"

# 更新 Homebrew Cask
.PHONY: update-homebrew
update-homebrew: ## 更新 Homebrew Cask (需要设置 GH_PAT 环境变量)
	@echo "$(BLUE)开始 Homebrew cask 更新流程...$(RESET)"
	@if [ -z "$(GH_PAT)" ]; then \
		echo "$(RED)错误: 需要设置 GH_PAT 环境变量$(RESET)"; \
		exit 1; \
	fi
	@echo "$(YELLOW)当前版本信息:$(RESET)"
	@echo "    - VERSION: $(VERSION)"
	@echo "    - CLEAN_VERSION: $(CLEAN_VERSION)"

	@echo "$(BLUE)准备工作目录...$(RESET)"
	@rm -rf tmp && mkdir -p tmp
	
	@echo "$(BLUE)下载 DMG 文件...$(RESET)"
	@curl -L -o tmp/Prompts-arm64.dmg "https://github.com/samzong/prompts/releases/download/v$(CLEAN_VERSION)/Prompts_$(CLEAN_VERSION)_macOS_ARM64.dmg"
	@curl -L -o tmp/Prompts-x86_64.dmg "https://github.com/samzong/prompts/releases/download/v$(CLEAN_VERSION)/Prompts_$(CLEAN_VERSION)_macOS_Intel.dmg"

	@echo "$(BLUE)计算 SHA256 校验和...$(RESET)"
	@ARM64_SHA256=$$(shasum -a 256 tmp/Prompts-arm64.dmg | cut -d ' ' -f 1) && echo "    - ARM64 SHA256: $$ARM64_SHA256"
	@X86_64_SHA256=$$(shasum -a 256 tmp/Prompts-x86_64.dmg | cut -d ' ' -f 1) && echo "    - x86_64 SHA256: $$X86_64_SHA256"

	@echo "$(BLUE)克隆 Homebrew tap 仓库...$(RESET)"
	@cd tmp && git clone https://$(GH_PAT)@github.com/samzong/$(HOMEBREW_TAP_REPO).git
	@cd tmp/$(HOMEBREW_TAP_REPO) && echo "    - 创建新分支: $(BRANCH_NAME)" && git checkout -b $(BRANCH_NAME)

	@echo "$(BLUE)更新 cask 文件...$(RESET)"
	@ARM64_SHA256=$$(shasum -a 256 tmp/Prompts-arm64.dmg | cut -d ' ' -f 1) && \
	X86_64_SHA256=$$(shasum -a 256 tmp/Prompts-x86_64.dmg | cut -d ' ' -f 1) && \
	echo "$(BLUE)再次确认SHA256: ARM64=$$ARM64_SHA256, x86_64=$$X86_64_SHA256$(RESET)" && \
	cd tmp/$(HOMEBREW_TAP_REPO) && \
	echo "$(BLUE)当前目录: $$(pwd)$(RESET)" && \
	echo "$(BLUE)CASK_FILE路径: $(CASK_FILE)$(RESET)" && \
	if [ -f $(CASK_FILE) ]; then \
		echo "    - 发现现有cask文件，使用sed更新..."; \
		echo "    - cask文件内容 (更新前):"; \
		cat $(CASK_FILE); \
		sed -i '' "s/version \".*\"/version \"$(CLEAN_VERSION)\"/g" $(CASK_FILE); \
		echo "    - 更新版本号后的cask文件内容:"; \
		cat $(CASK_FILE); \
		if grep -q "Hardware::CPU.arm" $(CASK_FILE); then \
			echo "    - 更新ARM架构SHA256..."; \
			sed -i '' "/if Hardware::CPU.arm/,/else/ s/sha256 \".*\"/sha256 \"$$ARM64_SHA256\"/g" $(CASK_FILE); \
			echo "    - 更新Intel架构SHA256..."; \
			sed -i '' "/else/,/end/ s/sha256 \".*\"/sha256 \"$$X86_64_SHA256\"/g" $(CASK_FILE); \
			echo "    - 最终cask文件内容:"; \
			cat $(CASK_FILE); \
		else \
			echo "$(RED)未找到 cask 格式，无法更新 SHA256 值$(RESET)"; \
			exit 1; \
		fi; \
	else \
		echo "$(RED)未找到cask文件: $(CASK_FILE)$(RESET)"; \
		exit 1; \
	fi

	@echo "$(BLUE)检查更改...$(RESET)"
	@cd tmp/$(HOMEBREW_TAP_REPO) && \
	if ! git diff --quiet $(CASK_FILE); then \
		echo "    - 检测到更改，创建 pull request..."; \
		git add $(CASK_FILE); \
		git config user.name "GitHub Actions"; \
		git config user.email "actions@github.com"; \
		git commit -m "chore: update prompts to v$(CLEAN_VERSION)"; \
		git push -u origin $(BRANCH_NAME); \
		echo "    - 准备创建PR数据..."; \
		pr_data=$$(printf '{"title":"chore: update %s to v%s","body":"Auto-generated PR\\n\\n- Version: %s\\n- ARM64 SHA256: %s\\n- x86_64 SHA256: %s","head":"%s","base":"main"}' \
			"prompts" "$(CLEAN_VERSION)" "$(CLEAN_VERSION)" "$$ARM64_SHA256" "$$X86_64_SHA256" "$(BRANCH_NAME)"); \
		echo "    - PR数据: $$pr_data"; \
		curl -X POST \
			-H "Authorization: token $(GH_PAT)" \
			-H "Content-Type: application/json" \
			https://api.github.com/repos/samzong/$(HOMEBREW_TAP_REPO)/pulls \
			-d "$$pr_data"; \
		echo "$(GREEN)✅ Pull request 创建成功$(RESET)"; \
	else \
		echo "$(RED)cask 文件中没有检测到更改$(RESET)"; \
		exit 1; \
	fi

	@echo "$(BLUE)清理临时文件...$(RESET)"
	@rm -rf tmp
	@echo "$(GREEN)✅ Homebrew cask 更新流程完成$(RESET)"
