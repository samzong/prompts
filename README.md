# Prompt Snippets Manager

> **"We only manage prompts, the future of LLMs is prompt engineering."**

A free and open source prompt snippets manager for macOS Users. System-level prompt management tool that's not bound by any specific application.

## 🚀 Current Status

### ✅ Phase 1: Project Initialization (COMPLETED)

**1.1 Project Setup**
- ✅ TypeScript + React + Vite configuration
- ✅ Tailwind CSS integration with modern styling
- ✅ Zustand state management setup
- ✅ Project structure cleanup and optimization

**1.2 Basic Configuration**
- ✅ Tauri window properties optimization
- ✅ Application metadata and icons configuration
- ✅ Development and build scripts setup
- ✅ Debug environment configuration (VSCode)
- ✅ Path aliases and TypeScript strict mode

### 🔄 Next Phases

**Phase 2: Core UI Components** (TODO)
- [ ] Main window layout and navigation
- [ ] Quick picker (search overlay) component
- [ ] Prompt card/list components
- [ ] Search and filter functionality

**Phase 3: Data Management** (TODO)
- [ ] Local storage implementation
- [ ] CRUD operations for prompts
- [ ] Import/export functionality
- [ ] Backup and sync features

**Phase 4: System Integration** (TODO)
- [ ] Global hotkey implementation
- [ ] Menu bar integration
- [ ] System tray functionality
- [ ] Clipboard integration

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Tailwind CSS
- **Desktop**: Tauri 2.0 (Rust + WebView)
- **State Management**: Zustand
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with dark/light mode support

### Project Structure
```
src/
├── components/          # React components
├── store/              # Zustand state management
├── utils/              # Utility functions
├── types/              # TypeScript type definitions
└── assets/             # Static assets
```

## 🎯 Core Features

### Menu Bar Integration
- **Right Click** → Opens main window (Full Manager)
- **Left Click** → Opens quick picker (Search Overlay)

### Quick Picker (Search Overlay)
**Triggered by:**
- Global Hotkey: `Cmd+Shift+P` (configurable)
- Menu Bar Left Click

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

## ⌨️ Keyboard Shortcuts

### Global:
- `Cmd+Shift+P` - Open Quick Picker (configurable)

### Main Window:
- `Cmd+N` - New prompt
- `Cmd+F` - Focus search

## ⚙️ Settings & Preferences

- Show menu bar icon
- Launch at login
- Show in Dock
- Global Hotkey: Cmd+Shift+P
- Storage: Local (~/.prompts/)

## 🎨 Design Principles

- **Clean & Minimal**: Focus on content, not chrome
- **Consistent**: Unified design language throughout
- **Accessible**: Full keyboard navigation and screen reader support
- **Themeable**: Light/dark modes, customizable appearance

## 🛠️ Development

### Prerequisites
- Node.js 18+
- Rust (latest stable)
- macOS development environment

### Setup
```bash
# Clone the repository
git clone <repository-url>
cd prompts

# Install dependencies
npm install

# Start development server
npm run tauri:dev

# Build for production
npm run tauri:build
```

### Available Scripts
- `npm run dev` - Start Vite development server
- `npm run tauri:dev` - Start Tauri development mode
- `npm run build` - Build frontend for production
- `npm run tauri:build` - Build complete application
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint

### Debug Configuration
VSCode debug configurations are available for both development and production builds. Use the Debug panel to start debugging sessions.

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please read the contributing guidelines before submitting PRs.

---

**Development Status**: Phase 1 Complete ✅ | Ready for Phase 2 Development
