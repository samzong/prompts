# Prompt Snippets Manager - Design Specification

## Core Concept
**"We only manage prompts, the future of LLMs is prompt engineering."**

A free and open source prompt snippets manager for macOS Users. System-level prompt management tool that's not bound by any specific application.

---

## Menu Bar Integration

### Menu Bar Icon Behavior:
- **Right Click** → Opens main window (Full Manager)
- **Status Indicator** → Shows sync status / recent activity

### Menu Bar Dropdown (Right Click):
```
┌─────────────────────────────────┐
│ 📱 Prompt Snippets Manager      │
├─────────────────────────────────┤
│ 💡 SMART SUGGESTIONS            │
│ ┌─────────────────────────────┐ │
│ │ 📝 For Current App          │ │
│ │    Code Review Template     │ │
│ └─────────────────────────────┘ │
│ ─────────────────────────────── │
│ 🕐 Recent (3)                   │
│ ⭐ Favorites (5)                │
│ ─────────────────────────────── │
│ ⚙️  Open Main Window           │
│ 🔗 Preferences                 │
│ 📊 Usage Stats                 │
└─────────────────────────────────┘
```

---

## Main Window Design

### Layout Structure:
```
┌─────────────────────────────────────────────────────────────────┐
│ 🔴🟡🟢              Prompt Snippets Manager         [- □ ×]    │
├─────────────────────────────────────────────────────────────────┤
│ [Card ▼] [←] [→] [🔍 Search...] [🤖 AI] [⚙️ Tools ▼] [+ New]  │
├─────────────────────────────────────────────────────────────────┤
│ 🏠 All (13)           │ 💡 Smart Suggestions          [Sync ●]  │
│ ⭐ Favorites (6)      │ ┌─────────────────────────────────────┐  │
│ 🕐 Recent (8)         │ │ 📝 For VS Code: Code Review      │  │
│ 🤖 AI Suggested (3)   │ │ 📊 For Chrome: Data Analysis     │  │
│ ──────────────────────│ │ ✍️  For Notes: Blog Writing       │  │
│ 📁 FOLDERS            │ └─────────────────────────────────────┘  │
│ 💻 Coding (12)        │                                         │
│ ✍️  Writing (8)       │ 📋 Main Prompt Collection               │
│ 📊 Analysis (4)       │ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ │
│ ──────────────────────│ │ Card  │ │ Card  │ │ Card  │ │ Card  │ │
│ 🏷️  TAGS              │ │   1   │ │   2   │ │   3   │ │   4   │ │
│ #tag01 (1)           │ └───────┘ └───────┘ └───────┘ └───────┘ │
│ ──────────────────────│                                         │
│ 📈 ANALYTICS          │ ┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐ │
│ 🔥 Most Used          │ │ Card  │ │ Card  │ │ Card  │ │ Card  │ │
│ 📊 Performance        │ │   5   │ │   6   │ │   7   │ │   8   │ │
│ 🎯 Optimization       │ └───────┘ └───────┘ └───────┘ └───────┘ │
│ ──────────────────────│                                         │
│ 🛠️  TOOLS             │                                         │
│ 📝 Prompt Generator   │                                         │
│ 🔄 Version History    │                                         │
│ ⚡ Quick Actions      │                                         │
└───────────────────────└─────────────────────────────────────────┘
```

### Sidebar Components:

#### Smart Collections:
- **All (13)** - Complete overview with live count
- **Favorites (6)** - Starred prompts for quick access
- **Recent (8)** - Recently used/modified prompts
- **Uncategorized** - Prompts without folders/tags
- **AI Suggested** - Machine-recommended prompts

#### Manual Organization:
- **Folders** - Hierarchical organization (Work, Personal, etc.)
- **Tags** - Flexible labeling system (#coding, #writing, #debug)

#### Advanced Features (v2.0+):
- **Analytics** - Usage patterns and optimization insights
- **Tools** - AI generation, version control, integrations

---

## Quick Picker (Search Overlay)

### Triggered by:
- Global Hotkey: `Cmd+Shift+P` (configurable)
- Menu Bar Left Click
- URL Scheme: `prompt://search`

### Layout:
```
     ┌─────────────────────────────────────┐
     │ 🔍 Search prompts...                │
     ├─────────────────────────────────────┤
     │ 📝 Code Review Template             │
     │ #coding #review          ⭐ 5 uses │
     │ ──────────────────────────────────  │
     │ ✍️  Blog Writing Assistant          │
     │ #writing #content        ⭐ 12 uses│
     │ ──────────────────────────────────  │
     │ 🤔 Problem Solver                   │
     │ #analysis #thinking      ⭐ 3 uses │
     └─────────────────────────────────────┘
```

### Behavior:
- **Spotlight-like**: Appears centered on screen
- **Live Search**: Filter as you type (title, content, tags)
- **Keyboard Navigation**: Arrow keys + Enter to select
- **Smart Ranking**: Usage frequency + recency + relevance
- **Quick Copy**: Enter copies to clipboard immediately

---

## Prompt Structure & Data Model

### Prompt Object:
```json
{
  "id": "uuid-string",
  "title": "Code Review Template",
  "content": "Please review this code:\n\n{code}\n\nFocus on:\n- Security\n- Performance\n- Best practices",
  "description": "Comprehensive code review prompt with security focus",
  "variables": ["code"],
  "tags": ["coding", "review", "security"],
  "folder_id": "work-prompts",
  "metadata": {
    "created": "2024-01-01T10:00:00Z",
    "modified": "2024-01-15T14:30:00Z",
    "usage_count": 15,
    "last_used": "2024-01-20T09:15:00Z",
    "rating": 4.5,
    "version": "1.2"
  },
  "settings": {
    "show_variable_dialog": true,
    "auto_copy": true,
    "track_usage": true
  }
}
```

---

## Create/Edit Prompt Flow

### Create New Prompt:
1. **Trigger**: `Cmd+N` in main window or `+ New` button
2. **Dialog**: Full-screen editor with live preview
3. **Auto-suggestions**: Tags based on content analysis
4. **Variable Detection**: Automatic `{variable}` recognition

### Edit Dialog Layout:
```
┌─────────────────────────────────────────────────────────────┐
│ New Prompt                           [Save] [Cancel] [×]    │
├─────────────────────────────────────────────────────────────┤
│ Title: [Code Review Template                            ]   │
│ Folder: [Work ▼]                    Tags: [#coding +]      │
├─────────────────────────────────────────────────────────────┤
│ Content:                                                    │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Please review this code:                                │ │
│ │                                                         │ │
│ │ {code}                                                  │ │
│ │                                                         │ │
│ │ Focus on:                                               │ │
│ │ - Security vulnerabilities                              │ │
│ │ - Performance issues                                    │ │
│ │ - Code style and best practices                         │ │
│ │                                                         │ │
│ │ Provide specific, actionable suggestions.               │ │
│ └─────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────┤
│ Variables detected: {code}                                  │
│ ☑ Show input dialog when using this prompt                 │
│ ☑ Track usage statistics                                   │
│ ☐ Mark as favorite                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Variable Substitution System

### Variable Types:
- **Simple**: `{name}`, `{topic}`, `{context}`
- **Typed**: `{code:multiline}`, `{url:link}`, `{date:today}`
- **Optional**: `{description?}` - Shows only if needed

### Substitution Dialog:
```
┌─────────────────────────────────────────┐
│ Complete Prompt Variables          [×]  │
├─────────────────────────────────────────┤
│ code (required):                        │
│ ┌─────────────────────────────────────┐ │
│ │ function calculateTotal(items) {    │ │
│ │   return items.reduce((sum, item) =>│ │
│ │     sum + item.price, 0);           │ │
│ │ }                                   │ │
│ └─────────────────────────────────────┘ │
│                                         │
│ context (optional):                     │
│ [Performance optimization review    ]   │
│                                         │
│ ☑ Remember values for this session     │
│                                         │
│     [Copy to Clipboard] [Cancel]        │
└─────────────────────────────────────────┘
```

---

## Search & Discovery

### Search Features:
- **Full-text search**: Title, content, description
- **Tag filtering**: `#coding #review` (AND/OR logic)
- **Folder filtering**: Within specific folders
- **Usage-based ranking**: Most used appear first
- **Fuzzy matching**: Typo-tolerant search
- **Smart suggestions**: Recent searches, popular terms

### Search Syntax:
- `review code` - Full text search
- `#coding` - Tag search
- `folder:work` - Folder search  
- `used:>10` - Usage count filter
- `modified:<1week` - Date range filter

---

## Keyboard Shortcuts

### Global:
- `Cmd+Shift+P` - Open Quick Picker (configurable)

### Main Window:
- `Cmd+N` - New prompt
- `Cmd+F` - Focus search
- `Cmd+1,2,3...` - Select sidebar items
- `Space` - Quick preview selected prompt
- `Enter` - Edit selected prompt
- `Cmd+D` - Duplicate prompt
- `Cmd+Delete` - Delete prompt

### Quick Picker:
- `↑↓` - Navigate results
- `Enter` - Copy to clipboard
- `Cmd+Enter` - Copy and edit variables
- `Escape` - Close picker
- `Tab` - Cycle through search filters

---

## Settings & Preferences

### General Settings:
```
┌─────────────────────────────────────────┐
│ Preferences                        [×]  │
├─────────────────────────────────────────┤
│ ┌─ General ─────────────────────────────┐│
│ │ ☑ Show menu bar icon                 ││
│ │ ☑ Launch at login                    ││
│ │ ☑ Show in Dock                       ││
│ │                                      ││
│ │ Global Hotkey: [Cmd+Shift+P    ] [×] ││
│ │                                      ││
│ │ Default View: [Card View ▼]          ││
│ │ Theme: [System ▼]                    ││
│ └──────────────────────────────────────┘│
│ ┌─ Privacy ─────────────────────────────┐│
│ │ ☑ Track usage statistics             ││
│ │ ☑ Enable smart suggestions           ││
│ │ ☑ App context detection              ││
│ └──────────────────────────────────────┘│
│ ┌─ Data ────────────────────────────────┐│
│ │ Storage: Local (~/.prompts/)          ││
│ │ [Export Data] [Import Data]           ││
│ │ [Reset to Defaults]                   ││
│ └──────────────────────────────────────┘│
└─────────────────────────────────────────┘
```

---

## Technical Architecture

### Data Storage:
- **Format**: JSON files + SQLite index for search
- **Location**: `~/Library/Application Support/PromptSnippets/`
- **Backup**: Automatic local backups + optional iCloud sync

### File Structure:
```
~/Library/Application Support/PromptSnippets/
├── prompts.json          # Main prompt data
├── index.sqlite          # Search index
├── settings.json         # User preferences  
├── backups/             # Automatic backups
│   ├── 2024-01-20.json
│   └── 2024-01-19.json
└── plugins/             # Future extensibility
```

### Performance Optimization:
- **Lazy Loading**: Load prompts on demand
- **Search Index**: SQLite FTS for fast search
- **Caching**: In-memory cache for frequent prompts
- **Debounced Search**: 300ms delay for live search

---

## Future Extensibility (v2.0+)

### Smart Features:
- **AI Suggestions**: Based on current app context
- **Auto-categorization**: ML-powered tag suggestions  
- **Usage Analytics**: Performance metrics and optimization
- **Version History**: Track prompt evolution over time

### Integration Capabilities:
- **URL Schemes**: `prompt://open/id`, `prompt://create`
- **API Endpoints**: REST API for external integrations
- **Plugin System**: Custom extensions and workflows
- **Export Formats**: Markdown, CSV, JSON, Custom

### Sync & Collaboration:
- **iCloud Integration**: Cross-device synchronization
- **Team Workspaces**: Shared prompt collections
- **Public Gallery**: Community prompt sharing
- **Import Sources**: Import from popular AI tools

---

## Design Principles

### User Experience:
- **Speed First**: Quick access from anywhere in macOS
- **Minimal Friction**: Fewest clicks to copy a prompt
- **Progressive Disclosure**: Simple by default, powerful when needed
- **Native Feel**: Follows macOS design patterns

### Technical Philosophy:
- **Local First**: Works offline, sync is optional
- **Privacy Focused**: User data stays local by default
- **Extensible**: Plugin architecture for future growth
- **Performance**: Instant search and response times

### Visual Design:
- **Clean & Minimal**: Focus on content, not chrome
- **Consistent**: Unified design language throughout
- **Accessible**: Full keyboard navigation and screen reader support
- **Themeable**: Light/dark modes, customizable appearance

