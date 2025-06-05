import React from 'react';
import { Prompt } from '../../store';
import { Button, IconButton } from '../ui/Button';

interface PromptCardProps {
  prompt: Prompt;
  viewMode?: 'grid' | 'list';
  isSelected?: boolean;
  onSelect?: (prompt: Prompt) => void;
  onEdit?: (prompt: Prompt) => void;
  onDelete?: (prompt: Prompt) => void;
  onCopy?: (prompt: Prompt) => void;
}

export const PromptCard: React.FC<PromptCardProps> = ({
  prompt,
  viewMode = 'grid',
  isSelected = false,
  onSelect,
  onEdit,
  onDelete,
  onCopy,
}) => {
  const handleCopyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onCopy?.(prompt);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(prompt);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete?.(prompt);
  };

  if (viewMode === 'list') {
    return (
      <div
        onClick={() => onSelect?.(prompt)}
        className={`group flex p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all cursor-pointer ${
          isSelected ? 'ring-2 ring-blue-500' : ''
        }`}
      >
        <div className="flex-1 min-w-0 mr-4">
          {/* 标题和描述 */}
          <div className="mb-2">
            <h3 className="text-base font-medium text-gray-900 dark:text-white truncate">
              {prompt.title}
            </h3>
            {prompt.description && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                {prompt.description}
              </p>
            )}
          </div>

          {/* 内容预览 */}
          <div className="text-sm text-gray-600 dark:text-gray-300 mb-2 line-clamp-2">
            {prompt.content}
          </div>

          {/* 标签和统计信息 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {prompt.tags?.slice(0, 3).map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded"
                >
                  {tag}
                </span>
              ))}
              {prompt.tags && prompt.tags.length > 3 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  +{prompt.tags.length - 3} more
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3 text-xs text-gray-500 dark:text-gray-400">
              {prompt.variables && prompt.variables.length > 0 && (
                <span>{prompt.variables.length} vars</span>
              )}
              <span>{new Date(prompt.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        
        {/* 操作按钮 */}
        <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <IconButton
          variant="ghost"
          size="sm"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          }
          onClick={handleCopyClick}
        />
          <IconButton
            variant="ghost"
            size="sm"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            }
            onClick={handleEditClick}
            className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
          />
          <IconButton
            variant="ghost"
            size="sm"
            icon={
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            }
            onClick={handleDeleteClick}
            className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
          />
        </div>
      </div>
    );
  }

  // Grid view - 紧凑的卡片设计
  return (
    <div
      onClick={() => onSelect?.(prompt)}
      className={`group relative p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg hover:shadow-md transition-all cursor-pointer h-44 ${
        isSelected ? 'ring-2 ring-blue-500' : ''
      }`}
    >
      {/* 标题和快捷复制 */}
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-base font-medium text-gray-900 dark:text-white leading-tight flex-1 pr-2">
          {prompt.title}
        </h3>
        <IconButton
          variant="ghost"
          size="sm"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
          }
          onClick={handleCopyClick}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        />
      </div>

      {/* 内容预览 */}
      <div className="text-sm text-gray-600 dark:text-gray-300 mb-3 h-12 overflow-hidden line-clamp-2">
        {prompt.content}
      </div>

      {/* 标签 */}
      {prompt.tags && prompt.tags.length > 0 && (
        <div className="flex items-center space-x-1 mb-3">
          {prompt.tags.slice(0, 2).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded"
            >
              {tag}
            </span>
          ))}
          {prompt.tags.length > 2 && (
            <span className="text-xs text-gray-500 dark:text-gray-400">
              +{prompt.tags.length - 2}
            </span>
          )}
        </div>
      )}

      {/* 底部统计信息 */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 transition-opacity group-hover:opacity-0">
        <div className="flex items-center space-x-3">
          {prompt.variables && prompt.variables.length > 0 && (
            <span>{prompt.variables.length} vars</span>
          )}
          <span>{prompt.content.length} chars</span>
        </div>
        <span>{new Date(prompt.updatedAt).toLocaleDateString()}</span>
      </div>

      {/* 操作按钮 - 悬浮时覆盖底部信息 */}
      <div className="absolute bottom-4 left-4 right-4 flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity bg-white dark:bg-gray-800 rounded">
        <Button
          variant="outline"
          size="sm"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
          }
          onClick={handleEditClick}
          className="flex-1 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 border-blue-300 dark:border-blue-600 hover:border-blue-400 dark:hover:border-blue-500"
        >
          Edit
        </Button>
        <IconButton
          variant="outline"
          size="sm"
          icon={
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          }
          onClick={handleDeleteClick}
          className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
        />
      </div>
    </div>
  );
}; 