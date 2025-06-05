import React from 'react';
import { useAppStore } from '../../store';

export const Footer: React.FC = () => {
  const { prompts } = useAppStore();

  // 统计信息
  const totalPrompts = prompts.length;
  const totalTags = [...new Set(prompts.flatMap(p => p.tags))].length;

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 px-6 py-2">
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
        {/* 左侧统计信息 */}
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            {totalPrompts} prompts
          </span>

          <span className="flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            {totalTags} tags
          </span>
        </div>

        {/* 右侧状态和版本 */}
        <div className="flex items-center space-x-4">
          {/* 同步状态 */}
          <div className="flex items-center">
            <div className="w-2 h-2 bg-green-400 rounded-full mr-1"></div>
            <span>Ready</span>
          </div>

          {/* 应用版本 */}
          <span className="text-gray-400 dark:text-gray-500">
            v0.1.0
          </span>
        </div>
      </div>
    </footer>
  );
}; 