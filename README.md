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

### ✅ Phase 2: Core UI Components (COMPLETED)

**2.1 Layout Components**
- ✅ Main window layout with sidebar and content area
- ✅ Navigation component with menu items
- ✅ Header component with search and actions
- ✅ Footer component with status information

**2.2 Prompt Components**
- ✅ Prompt card component for grid/list view
- ✅ Prompt detail view component
- ✅ Prompt editor component (create/edit)
- ✅ Prompt preview component

### ✅ Phase 3: Data Management (COMPLETED)

**3.1 Tauri Backend Setup**
- ✅ File system and dialog plugins integration
- ✅ Cross-platform storage permissions configuration
- ✅ Backend service architecture implementation

**3.2 Storage Services**
- ✅ Local file system storage with AppData directory
- ✅ JSON data persistence and backup functionality
- ✅ Data validation and migration utilities
- ✅ Cross-platform compatibility

**3.3 CRUD Operations**
- ✅ Complete prompt lifecycle management
- ✅ Async operations with proper error handling
- ✅ Variable extraction and management
- ✅ Usage statistics and analytics

**3.4 Import/Export Features**
- ✅ Multi-format support (JSON, CSV, Markdown)
- ✅ File dialog integration
- ✅ Backup creation and management
- ✅ Data validation and duplicate detection

### 🔄 Next Phases

### ✅ Phase 4: System Integration (IN PROGRESS)

**4.1 Global Shortcuts**
- ✅ Global hotkey implementation (`Cmd+Shift+P` for QuickPicker)

**4.2 System Tray/Menu Bar**
- ✅ Menu bar integration with tray icon
- ✅ Left click to toggle QuickPicker
- ✅ Right click to toggle main window
- ✅ Dual access mode: main window + system tray

**4.3 Clipboard Integration** (TODO)
- [ ] Clipboard integration

**Phase 5: Advanced Features** (TODO)
- [ ] Quick picker (search overlay) component
- [ ] Advanced search and filter functionality
- [ ] Prompt sharing and collaboration
- [ ] AI service integrations

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
- **Left Click** → Opens/toggles Quick Picker (Search Overlay)
- **Right Click** → Shows/toggles main window (Full Manager)
- Application supports both main window and system tray access

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
