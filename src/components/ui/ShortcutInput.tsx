import { useState, useEffect, useRef } from 'react';
import { settingsService } from '../../services/settingsService';

interface ShortcutInputProps {
  value: string;
  onChange: (shortcut: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export function ShortcutInput({ 
  value, 
  onChange, 
  disabled = false, 
  placeholder = "Click to record shortcut",
  className = ""
}: ShortcutInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const formatKeyName = (key: string): string => {
    const keyMap: Record<string, string> = {
      'Control': 'CommandOrControl',
      'Meta': 'CommandOrControl', // macOS Cmd 键
      'Alt': 'Alt',
      'Shift': 'Shift',
      ' ': 'Space',
    };
    
    return keyMap[key] || key.toUpperCase();
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    if (!isRecording) return;
    
    event.preventDefault();
    event.stopPropagation();

    const key = event.key;
    
    // 忽略单独的修饰键
    if (['Control', 'Meta', 'Alt', 'Shift'].includes(key)) {
      return;
    }

    const newPressedKeys = new Set<string>();
    
    // 添加修饰键
    if (event.ctrlKey || event.metaKey) {
      newPressedKeys.add('CommandOrControl');
    }
    if (event.altKey) {
      newPressedKeys.add('Alt');
    }
    if (event.shiftKey) {
      newPressedKeys.add('Shift');
    }
    
    // 添加主键
    const formattedKey = formatKeyName(key);
    newPressedKeys.add(formattedKey);
    
    setPressedKeys(newPressedKeys);
    
    // 如果有修饰键和主键，完成录入
    if (newPressedKeys.size >= 2) {
      const shortcutArray = Array.from(newPressedKeys);
      const mainKey = shortcutArray[shortcutArray.length - 1];
      const modifiers = shortcutArray.slice(0, -1);
      const shortcut = [...modifiers, mainKey].join('+');
      
      // 验证快捷键
      if (settingsService.validateShortcut(shortcut)) {
        onChange(shortcut);
        setIsRecording(false);
        setPressedKeys(new Set());
        setError('');
      } else {
        setError('Invalid shortcut combination');
      }
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    if (!isRecording) return;
    
    // 如果所有修饰键都释放了，清除已按下的键
    if (!event.ctrlKey && !event.metaKey && !event.altKey && !event.shiftKey) {
      if (pressedKeys.size === 1 && 
          ['CommandOrControl', 'Alt', 'Shift'].some(mod => pressedKeys.has(mod))) {
        setPressedKeys(new Set());
      }
    }
  };

  const startRecording = () => {
    if (disabled) return;
    
    setIsRecording(true);
    setPressedKeys(new Set());
    setError('');
    inputRef.current?.focus();
  };

  const stopRecording = () => {
    setIsRecording(false);
    setPressedKeys(new Set());
    setError('');
  };

  const handleBlur = () => {
    // 延迟停止录入，给按键事件时间完成
    setTimeout(stopRecording, 100);
  };

  const clearShortcut = () => {
    onChange('');
    setError('');
  };

  useEffect(() => {
    if (isRecording) {
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('keyup', handleKeyUp);
      
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keyup', handleKeyUp);
      };
    }
    
    // 当不在录制模式时，返回一个空的清理函数
    return () => {};
  }, [isRecording, pressedKeys]);

  const getDisplayValue = () => {
    if (isRecording) {
      if (pressedKeys.size === 0) {
        return 'Press the shortcut key...';
      }
      return Array.from(pressedKeys).join(' + ');
    }
    
    if (value) {
      return settingsService.formatShortcutDisplaySync(value);
    }
    
    return '';
  };

  return (
    <div className="space-y-2">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={getDisplayValue()}
          placeholder={placeholder}
          readOnly
          onClick={startRecording}
          onBlur={handleBlur}
          disabled={disabled}
          className={`
            w-full px-3 py-2 border border-gray-300 rounded-md
            bg-white dark:bg-gray-800 
            text-gray-900 dark:text-white
            placeholder-gray-500 dark:placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-100 dark:disabled:bg-gray-700 
            disabled:cursor-not-allowed
            cursor-pointer
            ${isRecording ? 'ring-2 ring-blue-500 border-transparent' : ''}
            ${error ? 'border-red-500 ring-2 ring-red-500' : ''}
            ${className}
          `}
        />
        
        {value && !isRecording && (
          <button
            type="button"
            onClick={clearShortcut}
            disabled={disabled}
            className="
              absolute right-2 top-1/2 transform -translate-y-1/2
              text-gray-400 hover:text-gray-600 dark:hover:text-gray-300
              disabled:opacity-50 disabled:cursor-not-allowed
              w-5 h-5 flex items-center justify-center
              rounded-full hover:bg-gray-100 dark:hover:bg-gray-700
              transition-colors
            "
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>
      
      {error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {error}
        </p>
      )}
      
      {isRecording && (
        <p className="text-sm text-blue-600 dark:text-blue-400">
        Recording mode: Please press the shortcut key combination you want
        </p>
      )}
      
      <p className="text-xs text-gray-500 dark:text-gray-400">
      Modifier keys (Cmd/Ctrl Shift letters) are recommended to avoid conflicts with system shortcut keys
      </p>
    </div>
  );
} 