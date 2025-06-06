# Prompts - 系统级提示词管理工具开发指南

## 项目概述

**Prompts** 是一个基于 Tauri v2 架构构建的现代化系统级提示词管理桌面应用程序。专为提高用户工作效率而设计，提供统一的提示词存储、管理和快速访问解决方案。

### 核心技术栈

- **后端**: Tauri v2.5.0 (Rust)
- **前端**: React 18.3.1 + TypeScript 5.6.2
- **样式**: Tailwind CSS 3.4.17
- **状态管理**: Zustand 5.0.2
- **构建工具**: Vite 6.0.3

### 项目特色功能

- 智能文件夹分层管理
- 灵活标签分类系统
- 实时搜索与过滤
- 一键剪贴板复制
- 全局快捷键支持
- 深色/浅色主题切换
- 响应式多视图布局（网格/列表）
- 本地文件系统存储
- 快速选择器 (Quick Picker)
- 可配置设置界面

---

## Tauri v2 开发最佳实践

### 架构设计原则

1. **分离关注点**: 前端专注 UI 交互，后端处理系统级操作
2. **类型安全**: 全面使用 TypeScript 和 Rust 类型系统
3. **性能优先**: 利用 Tauri 轻量级特性，避免不必要的依赖
4. **安全第一**: 遵循 Tauri 权限模型和 CSP 配置

### 插件使用指南

#### 核心插件配置 (Cargo.toml)

```toml
[dependencies]
tauri = { version = "2", features = ["macos-private-api", "tray-icon"] }
tauri-plugin-fs = "2"
tauri-plugin-dialog = "2"
tauri-plugin-global-shortcut = "2"
tauri-plugin-clipboard-manager = "2"
tauri-plugin-os = "2"
tauri-plugin-opener = "2"
```

#### 前端插件依赖 (package.json)

```json
{
  "@tauri-apps/api": "^2.5.0",
  "@tauri-apps/plugin-fs": "^2.3.0",
  "@tauri-apps/plugin-dialog": "^2.2.2",
  "@tauri-apps/plugin-global-shortcut": "^2.0.1",
  "@tauri-apps/plugin-clipboard-manager": "^2.2.2",
  "@tauri-apps/plugin-os": "^2.2.1"
}
```

#### 插件注册模式 (main.rs)

```rust
fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_global_shortcut::init())
        .plugin(tauri_plugin_clipboard_manager::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_opener::init())
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
```

### 权限管理最佳实践

#### Core 插件权限配置

```json
{
  "permissions": [
    "core:path:default",
    "core:event:default",
    "core:window:default",
    "core:app:default",
    "core:resources:default",
    "core:menu:default",
    "core:tray:default"
  ]
}
```

### 配置文件优化

#### 生产环境优化 (tauri.conf.json)

```json
{
  "$schema": "https://schema.tauri.app/config/2",
  "app": {
    "security": {
      "csp": "default-src 'self'"
    },
    "macOSPrivateApi": true
  },
  "bundle": {
    "createUpdaterArtifacts": true,
    "category": "Productivity",
    "targets": "all"
  }
}
```

#### 开发环境 Vite 配置

```javascript
export default defineConfig({
  clearScreen: false,
  server: {
    host: process.env.TAURI_DEV_HOST || false,
    port: 1420,
    strictPort: true,
    hmr: process.env.TAURI_DEV_HOST
      ? {
          protocol: "ws",
          host: process.env.TAURI_DEV_HOST,
          port: 1421,
        }
      : undefined,
    watch: {
      ignored: ["**/src-tauri/**"],
    },
  },
  build: {
    target:
      process.env.TAURI_ENV_PLATFORM === "windows" ? "chrome105" : "safari13",
    minify: !process.env.TAURI_ENV_DEBUG ? "esbuild" : false,
    sourcemap: !!process.env.TAURI_ENV_DEBUG,
  },
});
```

---

## 编码规范与最佳实践

### React 组件设计

1. **函数式组件**: 优先使用 React Hooks
2. **组件复用**: 提取通用 UI 组件到 `src/components/ui/`
3. **状态管理**: 复杂状态使用 Zustand，局部状态使用 useState
4. **性能优化**: 合理使用 useMemo、useCallback 避免不必要渲染

### TypeScript 类型设计

```typescript
// 定义严格的接口类型
interface Prompt {
  id: string;
  title: string;
  content: string;
  tags: string[];
  folderId?: string;
  createdAt: number;
  updatedAt: number;
}

// 使用联合类型提高代码安全性
type ViewMode = "grid" | "list";
type CurrentView = "main" | "detail" | "editor" | "settings";
```

### Rust 后端开发

1. **错误处理**: 使用 `Result<T, E>` 类型进行错误传播
2. **异步操作**: 合理使用 `async/await` 处理 I/O 操作
3. **内存安全**: 遵循 Rust 所有权和借用检查规则
4. **命令设计**: Tauri 命令保持简洁，单一职责

### 文件系统操作最佳实践

```typescript
// 前端调用示例
import { readTextFile, writeTextFile } from "@tauri-apps/plugin-fs";

const savePromptData = async (data: PromptData) => {
  try {
    await writeTextFile("prompts.json", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Failed to save data:", error);
    throw new Error("保存失败，请检查文件权限");
  }
};
```

---

## 开发工作流程

### 项目启动

```bash
# 开发模式启动
npm run tauri:dev

# 类型检查
npm run type-check

# 代码格式化
npm run lint:fix
```

### 构建发布

```bash
# 开发构建
npm run tauri:build:debug

# 生产构建
npm run tauri:build
```

### 调试技巧

1. **前端调试**: 使用浏览器开发者工具
2. **后端调试**: Rust 中使用 `println!` 或 `log` crate
3. **Tauri 调试**: 启用 `RUST_LOG=debug` 环境变量
4. **网络调试**: 使用 Tauri 内置的网络监控

---

## 性能优化指南

### 前端优化

- **代码分割**: 使用动态导入减少初始包大小
- **虚拟化**: 大列表使用虚拟滚动
- **图片优化**: 适当格式和尺寸的图标资源
- **状态优化**: 避免不必要的全局状态订阅

### 后端优化

- **异步 I/O**: 文件操作使用异步方法
- **内存管理**: 及时释放不再需要的资源
- **缓存策略**: 频繁访问的数据进行合理缓存
- **批量操作**: 减少频繁的小量数据交互

### 构建优化

```toml
# Cargo.toml - 生产环境优化
[profile.release]
codegen-units = 1
lto = true
opt-level = "s"
panic = "abort"
strip = true
```

---

## 安全考虑

### Tauri 安全模型

1. **CSP 配置**: 严格的内容安全策略
2. **权限最小化**: 只申请必要的系统权限
3. **输入验证**: 前后端都要进行数据验证
4. **更新机制**: 使用 Tauri 内置的安全更新系统

### 数据安全

- **本地存储**: 敏感数据考虑加密存储
- **路径遍历**: 防止恶意路径访问
- **输入清理**: 防止 XSS 和注入攻击

---

## 测试策略

### 前端测试

```bash
# 单元测试
npm run test

# E2E 测试 (推荐 Playwright)
npm run test:e2e
```

### 后端测试

```rust
#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_prompt_creation() {
        // 测试提示词创建逻辑
    }
}
```

---

## 部署与分发

### 多平台构建

```yaml
# GitHub Actions 示例
strategy:
  matrix:
    include:
      - platform: "macos-latest"
        args: "--target aarch64-apple-darwin"
      - platform: "macos-latest"
        args: "--target x86_64-apple-darwin"
      - platform: "ubuntu-22.04"
        args: ""
      - platform: "windows-latest"
        args: ""
```

### 自动更新配置

```json
{
  "plugins": {
    "updater": {
      "pubkey": "YOUR_PUBLIC_KEY",
      "endpoints": [
        "https://releases.myapp.com/{{target}}/{{arch}}/{{current_version}}"
      ]
    }
  }
}
```

---

## 常见问题解决

### 开发环境问题

1. **Rust 编译错误**: 检查 Rust 版本和目标平台
2. **前端构建失败**: 清理 node_modules 重新安装
3. **权限问题**: 检查 Tauri 权限配置
4. **热重载异常**: 重启开发服务器

### 生产环境问题

1. **启动缓慢**: 优化初始化逻辑
2. **内存泄漏**: 检查事件监听器清理
3. **文件访问权限**: 确认用户目录权限
4. **跨平台兼容性**: 测试不同操作系统

---

## 学习资源

### 官方文档

- [Tauri v2 官方文档](https://v2.tauri.app/)
- [Tauri 插件文档](https://v2.tauri.app/plugin/)
- [React 官方文档](https://react.dev/)

### 社区资源

- [Tauri GitHub](https://github.com/tauri-apps/tauri)
- [优秀项目参考](https://github.com/tw93/Pake)
- [开发者社区](https://discord.gg/tauri)

### 工具推荐

- **IDE**: VS Code + Rust Analyzer + ES7 React
- **调试**: Tauri DevTools + React Developer Tools
- **测试**: Vitest + Playwright + Cargo Test
- **部署**: GitHub Actions + Tauri Action

---

## 代码生成提示

在生成代码时，请始终：

1. **遵循项目架构**: 保持现有的文件组织结构
2. **类型安全优先**: 提供完整的 TypeScript 类型定义
3. **错误处理完善**: 包含适当的错误处理和用户反馈
4. **性能考虑**: 避免不必要的重渲染和计算
5. **可维护性**: 代码清晰、注释适当、职责单一
6. **安全性**: 遵循 Tauri 安全最佳实践
7. **一致性**: 与现有代码风格保持一致
8. **现代化**: 使用最新的 React 18、Tauri v2 特性

记住：始终查阅最新的 Tauri v2 官方文档和最佳实践，因为技术在不断演进。当遇到具体问题时，优先考虑官方推荐的解决方案。
