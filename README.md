# Prompt Snippets Manager - Design Specification

## Core Concept

**"We only manage prompts, the future of LLMs is prompt engineering."**

A free and open source prompt snippets manager for macOS Users. System-level prompt management tool that's not bound by any specific application.

## Menu Bar Integration

- **Right Click** → Opens main window (Full Manager)
- **Left Click** → Opens quick picker (Search Overlay)

## Quick Picker (Search Overlay)

### Triggered by:
- Global Hotkey: `Cmd+Shift+P` (configurable)
- Menu Bar Left Click


## Main Window Design

参考发送的设计图

## Prompt Structure

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

# Keyboard Shortcuts

### Global:
- `Cmd+Shift+P` - Open Quick Picker (configurable)

### Main Window:
- `Cmd+N` - New prompt
- `Cmd+F` - Focus search


## Settings & Preferences

Show menu bar icon
Launch at login
Show in Dock
Global Hotkey: Cmd+Shift+P
Storage: Local (~/.prompts/)


### Visual Design:
- **Clean & Minimal**: Focus on content, not chrome
- **Consistent**: Unified design language throughout
- **Accessible**: Full keyboard navigation and screen reader support
- **Themeable**: Light/dark modes, customizable appearance
