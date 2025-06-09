# Prompts

> **"We only manage prompts, the future of LLMs is prompt engineering."**

A free and open source prompt management tool for Users. System-level prompt management tool that's not bound by any specific application.


https://github.com/user-attachments/assets/50b02fe6-e81b-4cbb-bf89-c5fb9997ca1b




## 🏗️ Architecture

### Tech Stack

- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Desktop**: Tauri 2.0 (Rust + WebView)
- **State Management**: Zustand
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with dark/light mode support

## 🎯 Core Features

### System Tray Integration

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

### Getting Started
- `npm install` - Install dependencies
- `npm run tauri:dev` - Start Tauri development mode

### Building
- `make build` - Build for current platform
- `make build-all` - Build for all platforms (macOS Intel/ARM64, Windows)
- `make build-macos-arm64` - Build for macOS Apple Silicon
- `make build-macos-intel` - Build for macOS Intel
- `make build-windows` - Build for Windows (auto-setup cross-compilation)

### Windows Cross-compilation
On macOS, Windows builds are fully automated:
- First time: `make build-windows` (automatically installs xwin and Windows SDK)
- Subsequent builds: `make build-windows` (uses cached dependencies)
- Clean environment: `make clean-all` (removes all cached dependencies)
