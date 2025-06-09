# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Prompts is a system-level prompt management desktop application built with Tauri v2 and React. It allows users to organize, search, and quickly access prompt templates with features like folders, tags, global shortcuts, and a quick picker interface.

**Tech Stack:**
- Frontend: React 18.3.1 + TypeScript 5.6.2 + Tailwind CSS
- Backend: Tauri 2.5.0 (Rust) 
- State Management: Zustand 5.0.2
- Build Tool: Vite 6.0.3

## Development Commands

### Essential Commands
```bash
# Start development server
npm run tauri:dev

# Build for production
npm run tauri:build

# Build for debug
npm run tauri:build:debug

# Type checking
npm run type-check

# Linting
npm run lint
npm run lint:fix

# Install dependencies
npm install
```

### Using Makefile (Recommended)
```bash
# Development
make dev                    # Start development server
make install               # Install all dependencies

# Building
make build                 # Build for current platform
make build-all             # Build for all platforms (macOS M1/Intel, Windows)
make build-macos-arm64     # Build for macOS Apple Silicon
make build-macos-intel     # Build for macOS Intel

# Utilities
make doctor                # Check development environment
make clean                 # Clean build files
make info                  # Show project information
```

## Architecture

### Frontend Structure (`src/`)
- `components/`: Reusable UI components
  - `ui/`: Generic UI components (Button, Modal, Toast, etc.)
  - `prompt/`: Prompt-specific components (PromptCard, PromptEditor, etc.)
  - `layout/`: Layout components (Header, Footer, Navigation, etc.)
- `services/`: Business logic and data access
  - `promptService.ts`: Core prompt CRUD operations
  - `settingsService.ts`: Application settings management
  - `storage.ts`: File system operations
  - `importExportService.ts`: Data import/export functionality
- `store/`: Zustand global state management
- `hooks/`: Custom React hooks

### Backend Structure (`src-tauri/src/`)
- `main.rs`: Application entry point
- `lib.rs`: Tauri commands and system integrations
- Key features implemented:
  - Global shortcuts (Cmd+Shift+P for quick picker)
  - System tray integration
  - Window management (main window + quick picker)
  - File system operations via Tauri plugins

### Data Models
```typescript
interface Prompt {
  id: string;
  title: string;
  content: string;
  description?: string;
  variables: string[];  // Auto-extracted from {variable} syntax
  tags: string[];
  folderId?: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount?: number;
}

interface Folder {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Key Features

### Dual Window System
- **Main Window**: Full application interface for managing prompts
- **Quick Picker**: Lightweight overlay window for fast prompt access
  - Triggered by global shortcut (default: Cmd+Shift+P)
  - Appears as floating window above other applications

### System Integration
- **Global Shortcuts**: Configurable keyboard shortcuts via Tauri
- **System Tray**: Left click opens Quick Picker, right click toggles main window
- **Clipboard Integration**: One-click copying of prompt content with variable substitution
- **Theme Support**: Dark/light mode with system preference detection

### Data Management
- **Local Storage**: JSON files stored in user's app data directory
- **Real-time Search**: Search across title, content, tags, and descriptions
- **Variable System**: Auto-extract and substitute `{variable}` placeholders in prompts
- **Import/Export**: Backup and restore functionality

## Development Guidelines

### State Management
- Use Zustand store (`src/store/index.ts`) for global state
- Local component state with `useState` for UI-only state
- Store handles all business logic and API calls to services

### Component Patterns
- Functional components with TypeScript interfaces
- Extract reusable UI components to `src/components/ui/`
- Use compound component patterns for complex UI (e.g., PromptEditor)

### File Operations
All file operations go through the storage service which uses Tauri's fs plugin:
```typescript
// Example: Reading prompts
import { storageService } from './services/storage';
const prompts = await storageService.loadPrompts();
```

### Tauri Commands
Backend commands are defined in `src-tauri/src/lib.rs` and called from frontend:
```typescript
import { invoke } from '@tauri-apps/api/core';
await invoke('toggle_quick_picker');
```

### Styling
- Tailwind CSS with custom component classes
- Dark mode support via CSS variables
- Responsive design (grid/list view modes)

## Testing

Currently no formal testing setup. When adding tests:
- Frontend: Consider Vitest + React Testing Library
- Backend: Use Rust's built-in test framework with `cargo test`
- E2E: Tauri supports Playwright integration

## Common Development Tasks

### Adding New Prompt Fields
1. Update `Prompt` interface in `src/store/index.ts`
2. Update database schema in `src/services/storage.ts`
3. Update UI components in `src/components/prompt/`
4. Update form validation in `PromptEditor`

### Adding New Tauri Commands
1. Define command in `src-tauri/src/lib.rs`
2. Add to invoke_handler in `main.rs`
3. Create TypeScript wrapper in appropriate service file

### Adding New System Integrations
- All system-level features go through Tauri plugins
- Check existing plugins in `src-tauri/Cargo.toml`
- Follow Tauri v2 security model and permissions

## Build and Release

### Multi-platform Building
The project supports building for multiple platforms:
- macOS (Intel and Apple Silicon)
- Windows (x86_64)

**Windows Cross-compilation from macOS:**
- First-time setup: `make setup-windows-cross` (automatically installs dependencies)
- Build: `make build-windows`
- The setup includes installing xwin, downloading Windows SDK, and configuring Cargo
- Dependencies are cached in `~/.xwin` for reuse across projects

**Building all platforms:**
- Use `make build-all` for all platforms

### Release Process
- Use `scripts/release.sh` for automated releases
- Supports Homebrew cask updates via `make update-homebrew`
- Build artifacts are stored in `releases/` directory

## Security Considerations

- Tauri security model with minimal permissions
- Local file system access only (no network requests)
- Content Security Policy configured in `tauri.conf.json`
- User data stored in platform-appropriate app data directories

## Important Notes

- This is a desktop-only application (no web or mobile versions)
- All data is stored locally - no cloud sync or external services
- Variable extraction happens automatically from `{variable}` syntax in prompt content
- Quick Picker auto-hides when losing focus
- Global shortcuts are configurable and persistent across app restarts