# Prompts

> **"We only manage prompts, the future of LLMs is prompt engineering."**

A free and open source prompt management tool for Users. System-level prompt management tool that's not bound by any specific application.

https://github.com/user-attachments/assets/50b02fe6-e81b-4cbb-bf89-c5fb9997ca1b

## ✨ Product Features

### 🏠 **Main Application**

#### **Prompt Management**

- **Create & Edit**: Rich editor with title, description, content, tags, and folder organization
- **Smart Variables**: Auto-detect `{variable}` syntax for dynamic content replacement
- **One-click Copy**: Copy prompts to clipboard with usage tracking
- **Detailed View**: Dedicated preview page with variable substitution interface

#### **Organization System**

- **Folders**: Create hierarchical structure, drag-and-drop organization, right-click menus
- **Tags**: Multi-tag support with color coding and usage statistics
- **Views**: Switch between grid (cards) and list layouts
- **Filtering**: Multi-dimensional filtering by folders, tags, and custom categories

#### **Advanced Search**

- **Real-time Search**: Instant results across titles, content, descriptions, and tags
- **Smart Ranking**: Title matches prioritized, prefix matching bonus
- **Live Filtering**: Dynamic results as you type

### ⚡ **Quick Picker (System-wide Access)**

#### **Global Shortcut Access**

- **Default**: `Cmd+Shift+P` (fully customizable)
- **System-wide**: Works from any application
- **Floating Window**: Non-intrusive overlay that auto-hides

#### **Lightning-fast Search**

- **Intelligent Ranking**: Prioritizes title matches and recent usage
- **Keyboard Navigation**: `↑↓` to navigate, `Enter` to copy, `Esc` to close
- **Real-time Results**: Shows all matching prompts as you type
- **Smart Filtering**: Empty search shows no results, encouraging focused search

### 🔧 **Smart Variable System**

#### **Dynamic Content**

- **Auto-detection**: Recognizes `{variable}` patterns in prompt content
- **Live Preview**: Real-time content preview with variable substitution
- **Flexible Input**: Fill variables through intuitive interface
- **Copy Options**: Choose between original or processed content

### 📊 **Data Management**

#### **Import/Export**

- **Multiple Formats**: JSON (complete), CSV (tabular), Markdown (readable)
- **Smart Import**: Duplicate detection with preview and confirmation
- **Backup System**: Manual export to any location, import restoration

#### **Usage Analytics**

- **Statistics Dashboard**: Total prompts, tags, folders, usage counts
- **Activity Tracking**: Recent creation and update metrics (7-day window)
- **Usage Monitoring**: Automatic copy count tracking

### ⚙️ **System Integration & Settings**

#### **Deep System Integration**

- **System Tray**:
  - Left-click: Open Quick Picker
  - Right-click: Toggle main window
- **Startup Options**: Launch on system boot
- **Dock Control**: Show/hide in macOS Dock

#### **Personalization**

- **Themes**: Light, Dark, or System-following themes
- **Custom Shortcuts**: Configure global hotkey combinations
- **Interface Options**: Collapsible sidebar, view preferences

#### **Settings Management**

- **Easy Configuration**: All settings in one place
- **Reset Options**: Restore defaults with confirmation
- **Live Updates**: Changes apply immediately

### 💻 **User Experience**

#### **Intuitive Interface**

- **Context Menus**: Right-click operations for folders and tags
- **Hover Actions**: Show action buttons on card hover
- **Smart Dialogs**: Confirmation prompts for destructive actions
- **Status Feedback**: Toast notifications for all operations

#### **Keyboard-friendly**

- **Editor Shortcuts**: `Ctrl+S` save, `Esc` cancel, `Ctrl+C` copy
- **Navigation**: Full keyboard navigation support
- **Accessibility**: Proper focus management and screen reader support

#### **Responsive Design**

- **Dual Windows**: Main manager + lightweight Quick Picker
- **Memory Management**: Efficient state persistence
- **Performance**: Optimized for large prompt collections

### 🎯 **Use Cases**

**Perfect for:**

- **AI Engineers**: Managing prompt libraries for different models
- **Content Creators**: Organizing writing templates and creative prompts
- **Developers**: Code review templates, documentation snippets
- **Professionals**: Email templates, meeting agendas, standard responses
- **Researchers**: Question sets, interview guides, analysis frameworks

### 📱 **Cross-platform Support**

- **macOS**: Native Apple Silicon and Intel support
- **Windows**: Full feature parity with cross-compilation
- **Local-first**: All data stored locally, no cloud dependencies

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
