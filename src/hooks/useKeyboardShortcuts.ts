import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  cmd?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description?: string;
  preventDefault?: boolean;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[], enabled = true) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;
    
    // 跳过输入框中的快捷键
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
      // 只允许特定的快捷键在输入框中工作
      const allowedInInputs = ['Escape', 'Tab'];
      if (!allowedInInputs.includes(event.key)) {
        return;
      }
    }

    for (const shortcut of shortcuts) {
      const isShiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
      const isAltMatch = shortcut.alt ? event.altKey : !event.altKey;
      const isKeyMatch = event.key === shortcut.key;

      // 处理跨平台的 Ctrl/Cmd
      const isCmdOrCtrlMatch = 
        (shortcut.ctrl && !shortcut.cmd && (event.ctrlKey || event.metaKey)) ||
        (shortcut.cmd && !shortcut.ctrl && event.metaKey) ||
        (shortcut.ctrl && shortcut.cmd && event.ctrlKey && event.metaKey) ||
        (!shortcut.ctrl && !shortcut.cmd && !event.ctrlKey && !event.metaKey);

      if (isKeyMatch && isCmdOrCtrlMatch && isShiftMatch && isAltMatch) {
        if (shortcut.preventDefault !== false) {
          event.preventDefault();
        }
        shortcut.action();
        break;
      }
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};

// 预定义的常用快捷键
export const createCommonShortcuts = (callbacks: {
  onSave?: (() => void) | undefined;
  onCancel?: (() => void) | undefined;
  onNew?: (() => void) | undefined;
  onEdit?: (() => void) | undefined;
  onDelete?: (() => void) | undefined;
  onCopy?: (() => void) | undefined;
  onSearch?: (() => void) | undefined;
  onRefresh?: (() => void) | undefined;
}): KeyboardShortcut[] => {
  const shortcuts: KeyboardShortcut[] = [];

  if (callbacks.onSave) {
    shortcuts.push({
      key: 's',
      ctrl: true,
      action: callbacks.onSave,
      description: 'Save'
    });
  }

  if (callbacks.onCancel) {
    shortcuts.push({
      key: 'Escape',
      action: callbacks.onCancel,
      description: 'Cancel/Close'
    });
  }

  if (callbacks.onNew) {
    shortcuts.push({
      key: 'n',
      ctrl: true,
      action: callbacks.onNew,
      description: 'New'
    });
  }

  if (callbacks.onEdit) {
    shortcuts.push({
      key: 'e',
      ctrl: true,
      action: callbacks.onEdit,
      description: 'Edit'
    });
  }

  if (callbacks.onDelete) {
    shortcuts.push({
      key: 'Delete',
      action: callbacks.onDelete,
      description: 'Delete'
    });
    shortcuts.push({
      key: 'Backspace',
      action: callbacks.onDelete,
      description: 'Delete'
    });
  }

  if (callbacks.onCopy) {
    shortcuts.push({
      key: 'c',
      ctrl: true,
      shift: true,
      action: callbacks.onCopy,
      description: 'Copy Content'
    });
  }

  if (callbacks.onSearch) {
    shortcuts.push({
      key: 'f',
      ctrl: true,
      action: callbacks.onSearch,
      description: 'Search'
    });
  }

  if (callbacks.onRefresh) {
    shortcuts.push({
      key: 'r',
      ctrl: true,
      action: callbacks.onRefresh,
      description: 'Refresh'
    });
  }

  return shortcuts;
};

// 显示快捷键帮助的钩子
export const useShortcutHelp = () => {
  const shortcuts: KeyboardShortcut[] = [
    { key: 'Ctrl+N', action: () => {}, description: 'Create new prompt' },
    { key: 'Ctrl+S', action: () => {}, description: 'Save prompt' },
    { key: 'Ctrl+E', action: () => {}, description: 'Edit prompt' },
    { key: 'Ctrl+Shift+C', action: () => {}, description: 'Copy prompt content' },
    { key: 'Ctrl+F', action: () => {}, description: 'Search prompts' },
    { key: 'Delete', action: () => {}, description: 'Delete selected item' },
    { key: 'Escape', action: () => {}, description: 'Cancel/Close' },
    { key: 'Ctrl+R', action: () => {}, description: 'Refresh' },
  ];

  return shortcuts;
}; 