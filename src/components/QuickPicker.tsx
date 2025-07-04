import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { PhysicalPosition } from '@tauri-apps/api/dpi';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { promptService } from '../services/promptService';
import { settingsService } from '../services/settingsService';
import { Prompt, useAppStore } from '../store';
import { clsx } from 'clsx';

interface QuickPickerResult {
  id: string;
  title: string;
  content: string;
  description?: string;
  tags: string[];
  score?: number;
}

export const QuickPicker: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<QuickPickerResult[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState(-1);
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [copiedItemId, setCopiedItemId] = useState<string | null>(null);
  const [showCopiedFeedback, setShowCopiedFeedback] = useState(false);
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // 获取设置更新函数
  const { settings, updateSettings } = useAppStore();
  
  // 初始化窗口位置
  const initializeWindowPosition = useCallback(async () => {
    try {
      const window = getCurrentWebviewWindow();
      
      // 直接从文件加载设置，避免 store 依赖
      await settingsService.initialize();
      const currentSettings = await settingsService.loadSettings();
      
      const savedPosition = currentSettings?.quickPicker?.position || settings.quickPicker.position;
      
      console.log('Initializing window position with saved position:', savedPosition); // 调试日志
      
      if (savedPosition && 
          typeof savedPosition.x === 'number' && 
          typeof savedPosition.y === 'number' &&
          !isNaN(savedPosition.x) && 
          !isNaN(savedPosition.y)) {
        // 使用保存的位置，创建 PhysicalPosition 对象
        console.log('Restoring to saved position:', savedPosition);
        const physicalPosition = new PhysicalPosition(savedPosition.x, savedPosition.y);
        await window.setPosition(physicalPosition);
      } else {
        // 使用默认居中位置
        console.log('No saved position or invalid position data, centering window');
        await window.center();
      }
    } catch (error) {
      console.error('Error initializing window position:', error);
      // 出错时默认居中
      try {
        const window = getCurrentWebviewWindow();
        await window.center();
      } catch (centerError) {
        console.error('Failed to center window:', centerError);
      }
    }
  }, [settings.quickPicker.position]);
  
  // 保存窗口位置
  const saveWindowPosition = useCallback(async () => {
    try {
      const window = getCurrentWebviewWindow();
      const position = await window.outerPosition();
      
      console.log('Saving window position:', position); // 调试日志
      
      // 直接使用设置服务，避免 store 依赖
      await settingsService.initialize();
      const currentSettings = await settingsService.loadSettings() || settings;
      
      // 确保保存的是简单的数字坐标对象
      const positionData = {
        x: Math.round(position.x),
        y: Math.round(position.y)
      };
      
      const newSettings = {
        ...currentSettings,
        quickPicker: {
          ...currentSettings.quickPicker,
          position: positionData
        }
      };
      
      await settingsService.saveSettings(newSettings);
      
      // 同时更新 store 中的设置
      try {
        await updateSettings({
          quickPicker: {
            position: positionData
          }
        });
      } catch (storeError) {
        console.warn('Failed to update store settings, but file saved:', storeError);
      }
      
      console.log('Window position saved successfully'); // 调试日志
    } catch (error) {
      console.error('Failed to save window position:', error);
    }
  }, [updateSettings, settings]);
  
  // 直接加载最新数据，而不依赖可能过时的 store 状态
  const loadLatestData = useCallback(async () => {
    try {
      setIsLoading(true);
      // 重置复制状态
      setCopiedItemId(null);
      setShowCopiedFeedback(false);
      
      // 初始化所有服务
      await promptService.initialize();
      await settingsService.initialize();
      
      const latestPrompts = await promptService.getAllPrompts();
      setPrompts(latestPrompts);
      
      // 延迟初始化窗口位置，确保设置已加载
      setTimeout(async () => {
        await initializeWindowPosition();
      }, 100);
    } catch (error) {
      console.error('Failed to load latest prompts:', error);
      setPrompts([]);
    } finally {
      setIsLoading(false);
    }
  }, [initializeWindowPosition]);

  // 组件挂载时加载最新数据
  useEffect(() => {
    loadLatestData();
  }, [loadLatestData]);

  // 监听窗口焦点事件，确保每次显示时都有最新数据
  useEffect(() => {
    const handleFocus = () => {
      loadLatestData();
    };

    const handleVisibilityChange = () => {
      if (!document.hidden) {
        loadLatestData();
      }
    };

    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [loadLatestData]);

  // 搜索函数
  const searchPrompts = useCallback((searchQuery: string): QuickPickerResult[] => {
    if (!searchQuery.trim()) {
      // 如果没有搜索词，返回空结果，只显示实时搜索反馈
      return [];
    }

    const query = searchQuery.toLowerCase();
    const matchedPrompts = prompts
      .map(prompt => {
        let score = 0;
        
        // 标题匹配（权重最高）
        if (prompt.title.toLowerCase().includes(query)) {
          score += 100;
          if (prompt.title.toLowerCase().startsWith(query)) {
            score += 50; // 前缀匹配额外加分
          }
        }
        
        // 内容匹配
        if (prompt.content.toLowerCase().includes(query)) {
          score += 30;
        }
        
        // 标签匹配
        prompt.tags.forEach(tag => {
          if (tag.toLowerCase().includes(query)) {
            score += 20;
          }
        });
        
        // 描述匹配
        if (prompt.description?.toLowerCase().includes(query)) {
          score += 10;
        }
        
        if (score > 0) {
          const result: QuickPickerResult = {
            id: prompt.id,
            title: prompt.title,
            content: prompt.content,
            tags: prompt.tags,
            score,
          };
          if (prompt.description) {
            result.description = prompt.description;
          }
          return result;
        }
        return null;
      })
      .filter((item): item is NonNullable<typeof item> => item !== null)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      // 移除结果数量限制，显示所有匹配的结果
      
    return matchedPrompts as QuickPickerResult[];
  }, [prompts]);

  // 处理搜索
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const searchResults = searchPrompts(query);
      setResults(searchResults);
      setSelectedIndex(0);
    }, 150); // 防抖延迟

    return () => clearTimeout(timeoutId);
  }, [query, searchPrompts]);

  // 定义处理函数
  const handleClose = useCallback(async () => {
    // 关闭前保存位置
    await saveWindowPosition();
    
    const window = getCurrentWebviewWindow();
    await window.hide();
  }, [saveWindowPosition]);

  const handleCopy = useCallback(async (result: QuickPickerResult) => {
    try {
      // 设置复制状态反馈
      setCopiedItemId(result.id);
      setShowCopiedFeedback(true);
      
      // 使用 promptService 来复制内容，这会自动更新使用计数
      const content = await promptService.copyPromptContent(result.id);
      await writeText(content);
      
      // 显示复制成功反馈，然后关闭窗口
      setTimeout(async () => {
        await handleClose();
      }, 300); // 300ms 后关闭窗口
      
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // 如果服务调用失败，回退到直接复制
      try {
        await writeText(result.content);
        // 显示反馈后关闭
        setTimeout(async () => {
          await handleClose();
        }, 300);
      } catch (fallbackError) {
        console.error('Fallback copy also failed:', fallbackError);
        // 复制失败，重置状态
        setCopiedItemId(null);
        setShowCopiedFeedback(false);
      }
    }
  }, [handleClose]);

  // 键盘事件处理 - 使用useCallback确保函数引用稳定
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      e.stopPropagation();
      handleClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results.length > 0 && results[selectedIndex]) {
        handleCopy(results[selectedIndex]);
      }
    }
  }, [results.length, selectedIndex, handleClose, handleCopy]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown, { capture: true });
    return () => document.removeEventListener('keydown', handleKeyDown, { capture: true });
  }, [handleKeyDown]);

  // 自动聚焦输入框
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  // 额外的ESC键处理保护 - 直接在window级别监听
  useEffect(() => {
    const handleWindowKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        e.stopImmediatePropagation();
        handleClose();
      }
    };

    window.addEventListener('keydown', handleWindowKeyDown, { capture: true, passive: false });
    return () => window.removeEventListener('keydown', handleWindowKeyDown, { capture: true });
  }, [handleClose]);

  // 使用 Tauri 内置拖拽功能
  const handleStartDrag = useCallback(async (e: React.MouseEvent) => {
    // 检查是否点击在不应该触发拖拽的元素上
    const target = e.target as Element;
    const isInput = target.tagName === 'INPUT' || target.closest('input');
    const isButton = target.tagName === 'BUTTON' || target.closest('button');
    const isInteractive = target.closest('[role="button"]') || target.closest('a');
    
    // 如果点击的不是交互元素，则启用拖拽
    if (!isInput && !isButton && !isInteractive) {
      console.log('Starting drag...'); // 调试日志
      try {
        const window = getCurrentWebviewWindow();
        await window.startDragging();
        
        // 拖拽结束后保存位置
        setTimeout(async () => {
          await saveWindowPosition();
        }, 800); // 增加延迟确保拖拽完成
      } catch (error) {
        console.error('Error starting drag:', error);
      }
    }
  }, [saveWindowPosition]);

  // 滚动到选中项
  useEffect(() => {
    if (resultsRef.current && selectedIndex >= 0) {
      const selectedElement = resultsRef.current.children[selectedIndex] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({ 
          block: 'nearest',
          behavior: 'smooth'
        });
      }
    }
  }, [selectedIndex]);

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 rounded px-0.5">
          {part}
        </span>
      ) : part
    );
  };

  const truncateContent = (content: string, maxLength: number = 100) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  // 计算动态高度
  const calculateHeight = () => {
    const headerHeight = 49; // 搜索框区域高度（包括border）
    const footerHeight = results.length > 0 ? 33 : 0; // 底部提示区域高度（包括border）
    const itemHeight = 68; // 每个结果项约68px（包括padding和margin）
    const maxItems = 5; // 最多显示5个项目不滚动
    const minContentHeight = 80; // 最小内容区域高度（空状态提示）
    const loadingHeight = 60; // 加载状态的高度
    
    let contentHeight;
    if (isLoading) {
      contentHeight = loadingHeight;
    } else if (results.length === 0) {
      contentHeight = minContentHeight; // 空状态时的最小高度
    } else if (results.length <= maxItems) {
      contentHeight = results.length * itemHeight + 8; // 额外的8px用于容器padding
    } else {
      contentHeight = maxItems * itemHeight + 8; // 超过5个时固定高度，启用滚动
    }
    
    return headerHeight + contentHeight + footerHeight;
  };

  return (
    <div 
      ref={containerRef}
      className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-2xl transition-all duration-200 flex flex-col cursor-grab hover:cursor-grab"
      style={{ height: `${calculateHeight()}px` }}
      onMouseDown={handleStartDrag}
    >
      {/* 搜索框区域 - 更紧凑 */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prompts..."
            className="w-full pl-8 pr-3 py-2 bg-transparent border-0 focus:outline-none focus:ring-0 text-sm placeholder-gray-400 text-gray-900 dark:text-white cursor-text"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>

      {/* 结果列表区域 - 动态高度 */}
      <div 
        ref={resultsRef}
        className="flex-1 overflow-y-auto"
        style={{
          minHeight: results.length === 0 && !isLoading ? '80px' : 'auto',
        }}
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-4 px-4 text-gray-500 dark:text-gray-400">
            {query.trim() && (
              <>
                <svg className="w-8 h-8 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-xs">No prompts found</p>
              </>
            )}
          </div>
        ) : (
          <div className="py-1">
            {results.map((result, index) => (
              <div
                key={result.id}
                className={clsx(
                  'group px-3 py-2 cursor-pointer transition-colors relative hover:bg-gray-50 dark:hover:bg-gray-800/50',
                  (selectedIndex === index || hoveredIndex === index) 
                    ? 'bg-blue-50 dark:bg-blue-900/20' 
                    : ''
                )}
                onClick={() => handleCopy(result)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(-1)}
                  >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {/* 单行布局：标题 + 简短预览 */}
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {highlightMatch(result.title, query)}
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {highlightMatch(truncateContent(result.content, 50), query)}
                      </span>
                    </div>
                    
                    {/* 标签显示在同一行 */}
                    {result.tags.length > 0 && (
                      <div className="flex items-center gap-1 mt-1">
                        {result.tags.slice(0, 2).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                          >
                            {highlightMatch(tag, query)}
                          </span>
                        ))}
                        {result.tags.length > 2 && (
                          <span className="text-xs text-gray-400">
                            +{result.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* 复制按钮区域 - 显示复制状态 */}
                  <div className="flex items-center gap-2">
                    {copiedItemId === result.id && showCopiedFeedback && (
                      <span className="text-xs text-green-600 dark:text-green-400 font-medium animate-pulse">
                        Copied!
                      </span>
                    )}
                    <button
                      className={clsx(
                        'p-1.5 rounded-md transition-all opacity-0 group-hover:opacity-100',
                        (selectedIndex === index || hoveredIndex === index)
                          ? 'opacity-100 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600',
                        copiedItemId === result.id && showCopiedFeedback && 'opacity-100 bg-green-100 dark:bg-green-800 text-green-600 dark:text-green-300'
                      )}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCopy(result);
                      }}
                      title={copiedItemId === result.id ? "Copied!" : "Copy to clipboard"}
                      disabled={copiedItemId === result.id && showCopiedFeedback}
                    >
                      {copiedItemId === result.id && showCopiedFeedback ? (
                        // 显示对勾图标
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        // 显示复制图标
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
                
                {/* 选中指示器 */}
                {selectedIndex === index && (
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-600 dark:bg-blue-400 rounded-r"></div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 底部提示 - 只在有结果时显示，更紧凑 */}
      {results.length > 0 && (
        <div className="px-3 py-1.5 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs">↑↓</kbd>
                Navigate
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs">⏎</kbd>
                Copy
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1 py-0.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs">⎋</kbd>
                Close
              </span>
            </div>
            <span>{results.length} results</span>
          </div>
        </div>
      )}
    </div>
  );
}; 