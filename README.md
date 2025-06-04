# Prompts - Tauri + React + TypeScript

一个基于 Tauri 构建的跨平台桌面应用，使用 React + TypeScript 作为前端技术栈。

## 功能特点

- 🚀 基于 Tauri 的高性能跨平台桌面应用
- ⚛️ 使用 React 18 + TypeScript 构建现代化 UI
- 🎨 基于 Vite 的快速开发体验
- 📦 支持 Windows、macOS、Linux 多平台打包
- 🔧 完整的开发工具链和自动化构建流程

## 开发环境要求

- Node.js 16+ 
- Rust 1.70+
- npm 或 yarn
- 各平台相关的构建工具

## 快速开始

### 使用 Make 命令（推荐）

```bash
# 查看所有可用命令
make help

# 快速开始开发
make quick-dev

# 启动开发服务器
make dev

# 构建应用
make build-app

# 构建所有平台安装包
make build-all
```

### 传统方式

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run tauri dev

# 构建应用
npm run tauri build
```

## Make 命令参考

### 开发命令

| 命令 | 描述 |
|------|------|
| `make dev` | 启动 Tauri 开发服务器 |
| `make dev-web` | 仅启动前端开发服务器 |
| `make install` | 安装项目依赖 |
| `make quick-dev` | 快速开始开发（安装依赖+启动） |

### 构建命令

| 命令 | 描述 |
|------|------|
| `make build` | 构建前端代码 |
| `make build-app` | 构建 Tauri 应用 |
| `make build-all` | 构建所有平台安装包 |
| `make build-linux` | 构建 Linux 平台安装包 |
| `make build-macos` | 构建 macOS 平台安装包 |
| `make build-windows` | 构建 Windows 平台安装包 |

### 代码质量

| 命令 | 描述 |
|------|------|
| `make check` | 检查代码质量 |
| `make format` | 格式化代码 |
| `make lint` | 代码风格检查 |
| `make test` | 运行测试 |

### 发布命令

| 命令 | 描述 |
|------|------|
| `make release` | 发布版本（检查+测试+构建） |
| `make release-all` | 发布所有平台版本 |
| `make package` | 创建分发包 |

### 工具命令

| 命令 | 描述 |
|------|------|
| `make clean` | 清理构建文件 |
| `make clean-all` | 清理所有文件（包括依赖） |
| `make update` | 更新依赖 |
| `make info` | 显示项目信息 |
| `make doctor` | 检查开发环境 |

## 项目结构

```
prompts/
├── src/                    # 前端源码
│   ├── assets/            # 静态资源
│   └── ...
├── src-tauri/             # Tauri 后端
│   ├── src/               # Rust 源码
│   ├── icons/             # 应用图标
│   └── tauri.conf.json    # Tauri 配置
├── public/                # 公共资源
├── dist/                  # 构建输出
├── Makefile              # 自动化构建脚本
├── package.json          # Node.js 依赖配置
├── vite.config.ts        # Vite 配置
└── README.md             # 项目说明文档
```

## 构建输出

构建完成后，安装包位于：
- **Linux**: `src-tauri/target/release/bundle/deb/`（.deb）、`src-tauri/target/release/bundle/appimage/`（.AppImage）
- **macOS**: `src-tauri/target/release/bundle/dmg/`（.dmg）、`src-tauri/target/release/bundle/macos/`（.app）
- **Windows**: `src-tauri/target/release/bundle/msi/`（.msi）、`src-tauri/target/release/bundle/nsis/`（.exe）

## 开发指南

### 前端开发
- 使用 React 18 + TypeScript
- 样式可使用 CSS Modules 或 styled-components
- 状态管理可根据需要集成 Redux、Zustand 等

### 后端开发
- Rust 代码位于 `src-tauri/src/`
- 可通过 Tauri API 与前端通信
- 支持系统原生功能调用

### 跨平台注意事项
- 不同平台的 UI 表现可能略有差异
- 文件路径处理需考虑平台兼容性
- 权限和安全策略各平台有所不同

## 推荐 IDE 设置

- [VS Code](https://code.visualstudio.com/) + [Tauri](https://marketplace.visualstudio.com/items?itemName=tauri-apps.tauri-vscode) + [rust-analyzer](https://marketplace.visualstudio.com/items?itemName=rust-lang.rust-analyzer)

## 故障排除

### 环境检查
```bash
make doctor
```

### 常见问题
1. **构建失败**: 检查 Node.js 和 Rust 版本是否符合要求
2. **依赖问题**: 运行 `make clean-all` 后重新安装
3. **平台构建**: 确保目标平台的构建工具链已正确安装

## 贡献指南

1. Fork 项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。
