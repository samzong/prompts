import React from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';

interface TitleBarProps {
  title?: string;
  showControls?: boolean;
  className?: string;
}

export const TitleBar: React.FC<TitleBarProps> = ({ 
  title = 'Prompt Snippets Manager',
  showControls = true,
  className = ''
}) => {
  const handleMinimize = async () => {
    const appWindow = getCurrentWindow();
    await appWindow.minimize();
  };

  const handleMaximize = async () => {
    const appWindow = getCurrentWindow();
    await appWindow.toggleMaximize();
  };

  const handleClose = async () => {
    const appWindow = getCurrentWindow();
    await appWindow.close();
  };

  return (
    <div 
      className={`flex items-center justify-between h-12 px-4 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50 drag-region ${className}`}
    >
      {/* 左侧：应用标题 */}
      <div className="flex items-center space-x-3">
        <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h1 className="text-sm font-medium text-gray-700 dark:text-gray-300 no-drag">
          {title}
        </h1>
      </div>

      {/* 右侧：窗口控制按钮 */}
      {showControls && (
        <div className="flex items-center space-x-2 no-drag">
          <button
            onClick={handleMinimize}
            className="w-3 h-3 bg-yellow-500 hover:bg-yellow-600 rounded-full transition-colors"
            aria-label="最小化"
          />
          <button
            onClick={handleMaximize}
            className="w-3 h-3 bg-green-500 hover:bg-green-600 rounded-full transition-colors"
            aria-label="最大化"
          />
          <button
            onClick={handleClose}
            className="w-3 h-3 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
            aria-label="关闭"
          />
        </div>
      )}
    </div>
  );
}; 