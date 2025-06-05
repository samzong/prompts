import React, { useState, useEffect, useRef, useCallback } from 'react';
import { getCurrentWebviewWindow } from '@tauri-apps/api/webviewWindow';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { promptService } from '../services/promptService';
import { Prompt } from '../store';
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
  
  const inputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  // 直接加载最新数据，而不依赖可能过时的 store 状态
  const loadLatestData = useCallback(async () => {
    try {
      setIsLoading(true);
      await promptService.initialize();
      const latestPrompts = await promptService.getAllPrompts();
      setPrompts(latestPrompts);
    } catch (error) {
      console.error('Failed to load latest prompts:', error);
      setPrompts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
      // 如果没有搜索词，返回最近使用的前3个
      return prompts
        .sort((a, b) => (b.usageCount || 0) - (a.usageCount || 0))
        .slice(0, 3)
        .map(prompt => {
          const result: QuickPickerResult = {
            id: prompt.id,
            title: prompt.title,
            content: prompt.content,
            tags: prompt.tags,
          };
          if (prompt.description) {
            result.description = prompt.description;
          }
          return result;
        });
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
      .slice(0, 3); // 最多显示3个结果

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

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
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
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [results, selectedIndex]);

  // 自动聚焦输入框
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

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

  const handleClose = async () => {
    const window = getCurrentWebviewWindow();
    await window.hide();
  };

  const handleCopy = async (result: QuickPickerResult) => {
    try {
      // 使用 promptService 来复制内容，这会自动更新使用计数
      const content = await promptService.copyPromptContent(result.id);
      await writeText(content);
      await handleClose();
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
      // 如果服务调用失败，回退到直接复制
      try {
        await writeText(result.content);
        await handleClose();
      } catch (fallbackError) {
        console.error('Fallback copy also failed:', fallbackError);
      }
    }
  };

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

  return (
    <div className="h-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border border-gray-200/50 dark:border-gray-700/50 rounded-xl shadow-2xl">
      {/* 搜索框区域 */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search prompts..."
            className="w-full pl-10 pr-4 py-3 bg-transparent border-0 focus:outline-none focus:ring-0 text-lg placeholder-gray-400 text-gray-900 dark:text-white"
            autoComplete="off"
            spellCheck={false}
          />
        </div>
      </div>

      {/* 结果列表区域 */}
      <div 
        ref={resultsRef}
        className="flex-1 overflow-y-auto max-h-80"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-sm">
              {query.trim() ? 'No prompts found' : 'Start typing to search prompts'}
            </p>
          </div>
        ) : (
          <div className="py-2">
            {results.map((result, index) => (
              <div
                key={result.id}
                className={clsx(
                  'group px-4 py-3 cursor-pointer transition-colors relative',
                  (selectedIndex === index || hoveredIndex === index) 
                    ? 'bg-blue-50 dark:bg-blue-900/20' 
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800/50'
                )}
                onClick={() => handleCopy(result)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(-1)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1 truncate">
                      {highlightMatch(result.title, query)}
                    </h3>
                    <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-2 mb-2">
                      {highlightMatch(truncateContent(result.content), query)}
                    </p>
                    {result.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {result.tags.slice(0, 3).map((tag, tagIndex) => (
                          <span
                            key={tagIndex}
                            className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          >
                            {highlightMatch(tag, query)}
                          </span>
                        ))}
                        {result.tags.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{result.tags.length - 3} more
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* 复制按钮 */}
                  <button
                    className={clsx(
                      'ml-3 p-2 rounded-md transition-all opacity-0 group-hover:opacity-100',
                      (selectedIndex === index || hoveredIndex === index)
                        ? 'opacity-100 bg-blue-100 dark:bg-blue-800 text-blue-600 dark:text-blue-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                    )}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopy(result);
                    }}
                    title="Copy to clipboard"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </button>
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

      {/* 底部提示 */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50">
        <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs">⏎</kbd>
              Copy
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs">⎋</kbd>
              Close
            </span>
          </div>
          <span>{results.length} results</span>
        </div>
      </div>
    </div>
  );
}; 