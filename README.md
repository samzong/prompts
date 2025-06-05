# Prompts

> **"We only manage prompts, the future of LLMs is prompt engineering."**

A free and open source prompt management tool for Users. System-level prompt management tool that's not bound by any specific application.

## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Desktop**: Tauri 2.0 (Rust + WebView)
- **State Management**: Zustand
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with dark/light mode support

## 🎯 Core Features

### Main Window

- **Left Click** → Opens/toggles Quick Picker (Search Overlay)
- **Right Click** → Shows/toggles main window (Full Manager)
- Application supports both main window and system tray access

### Menu Bar Integration

- **Left Click** → Opens/toggles Quick Picker (Search Overlay)
- **Right Click** → Shows/toggles main window (Full Manager)
- Application supports both main window and system tray access

### Quick Picker (Search Overlay)

**Triggered by:**

- Global Hotkey: `Cmd+Shift+P` (configurable)

### Prompt Structure

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

## Development

- `npm run tauri:dev` - Start Tauri development mode
- `make build-all` - Build for all platforms
- `make build-macos` - Build for macOS
