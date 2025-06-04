# Prompt Snippets Manager - 提示词片段管理器

## 核心理念

**"我们只管理提示词，LLM 的未来在于提示工程。"**

一个面向 macOS 用户的免费开源提示词片段管理器。系统级的提示词管理工具，不受限于任何特定应用。

## 菜单栏集成

- **右键点击** → 打开主窗口（完整管理器）
- **左键点击** → 打开快速选择器（搜索覆盖层）

## 快速选择器（搜索覆盖层）

### 触发方式：
- 全局快捷键：`Cmd+Shift+P`（可配置）  
- 菜单栏左击

## 主窗口设计

参考发送的设计图

## 提示词数据结构

```json
{
  "id": "uuid-string",
  "title": "Code Review Template",
  "content": "Please review this code:\n\n{code}\n\nFocus on:\n- Security\n- Performance\n- Best practices",
  "description": "Comprehensive code review prompt with security focus",
  "variables": ["code"],
  "tags": ["coding", "review", "security"],
  "folder_id": "work-prompts"
}
```

## 键盘快捷键

### 全局：
- `Cmd+Shift+P` - 打开快速选择器（可配置）

### 主窗口：
- `Cmd+N` - 新建提示词
- `Cmd+F` - 聚焦搜索

## 设置与偏好

- 是否显示菜单栏图标
- 是否开机自启动
- 是否显示在 Dock
- 配置全局快捷键：Cmd+Shift+P
- 配置存储位置：本地 (~/.prompts/)

## 视觉设计

- **简洁最小化**：专注内容，非装饰
- **一致性**：统一的设计语言
- **可访问性**：完全键盘导航和屏幕阅读器支持
- **主题化**：浅色/深色模式，优先考虑深色
