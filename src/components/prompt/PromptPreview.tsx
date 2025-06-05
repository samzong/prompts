import React from 'react';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { Prompt } from '../../store';

interface PromptPreviewProps {
  prompt: Prompt;
  onClose?: () => void;
  onEdit?: (prompt: Prompt) => void;
  onCopy?: (prompt: Prompt) => void;
  onFullView?: (prompt: Prompt) => void;
}

export const PromptPreview: React.FC<PromptPreviewProps> = ({
  prompt,
  onClose,
  onEdit,
  onCopy,
  onFullView,
}) => {
  const handleCopy = async () => {
    try {
      await writeText(prompt.content);
      onCopy?.(prompt);
    } catch (error) {
      console.error('Failed to copy prompt content:', error);
    }
  };

  const highlightVariables = (text: string) => {
    if (!prompt.variables.length) return text;
    
    let highlightedText = text;
    prompt.variables.forEach(variable => {
      const regex = new RegExp(`\\{${variable}\\}`, 'g');
      highlightedText = highlightedText.replace(
        regex,
        `<span class="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-1 rounded font-medium">{${variable}}</span>`
      );
    });
    return highlightedText;
  };

  const truncateContent = (content: string, maxLength: number = 300) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-2xl w-full max-h-[80vh] overflow-hidden">
      {/* 头部 */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
            {prompt.title}
          </h3>
          {prompt.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
              {prompt.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-2 ml-4">
          <button
            onClick={handleCopy}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="复制内容"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          </button>
          
          {onFullView && (
            <button
              onClick={() => onFullView(prompt)}
              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="查看详情"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
          )}
          
          {onEdit && (
            <button
              onClick={() => onEdit(prompt)}
              className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="编辑"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="关闭"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 内容 */}
      <div className="p-4 overflow-auto max-h-96">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm leading-relaxed">
          <div 
            dangerouslySetInnerHTML={{ 
              __html: highlightVariables(truncateContent(prompt.content))
            }}
            className="whitespace-pre-wrap text-gray-800 dark:text-gray-200"
          />
          {prompt.content.length > 300 && (
            <div className="mt-3 text-center">
              <button
                onClick={() => onFullView?.(prompt)}
                className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium"
              >
                View full content →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 底部信息 */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between">
          {/* 左侧：标签和变量 */}
          <div className="flex items-center space-x-4">
            {/* 标签 */}
            {prompt.tags.length > 0 && (
              <div className="flex items-center">
                <svg className="w-4 h-4 mr-1 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <div className="flex flex-wrap gap-1">
                  {prompt.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {prompt.tags.length > 3 && (
                    <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 text-xs rounded">
                      +{prompt.tags.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* 变量数量 */}
            {prompt.variables.length > 0 && (
              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                <span>{prompt.variables.length} variables</span>
              </div>
            )}
          </div>

          {/* 右侧：时间和统计 */}
          <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
            <span>{prompt.content.length} chars</span>
            <span>Updated {prompt.updatedAt.toLocaleDateString()}</span>
          </div>
        </div>

        {/* 变量列表 */}
        {prompt.variables.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">Variables:</div>
            <div className="flex flex-wrap gap-1">
              {prompt.variables.map((variable) => (
                <code
                  key={variable}
                  className="px-1.5 py-0.5 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs rounded"
                >
                  {variable}
                </code>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 