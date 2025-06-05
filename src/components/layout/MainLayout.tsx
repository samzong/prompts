import React from 'react';
import { Navigation } from './Navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { useAppStore } from '../../store';

interface MainLayoutProps {
  children: React.ReactNode;
  currentView: 'main' | 'detail' | 'editor' | 'settings';
  onNewPrompt?: () => void;
  onNewFolder?: () => void;
  onNewTag?: () => void;
  onBackToMain?: () => void;
  onOpenSettings?: () => void;
  onDeleteFolder?: (folderId: string, folderName: string) => void;
  onDeleteTag?: (tagId: string, tagName: string) => void;
  onRenameFolder?: (folderId: string, currentName: string) => void;
  onRenameTag?: (tagId: string, currentName: string) => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({ 
  children, 
  currentView, 
  onNewPrompt, 
  onNewFolder,
  onNewTag,
  onBackToMain,
  onOpenSettings,
  onDeleteFolder,
  onDeleteTag,
  onRenameFolder,
  onRenameTag
}) => {
  const { isSidebarCollapsed } = useAppStore();

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* 侧边栏 */}
      <div className={`${
        isSidebarCollapsed ? 'w-0' : 'w-64'
      } bg-white dark:bg-gray-800 shadow-sm border-r border-gray-200 dark:border-gray-700 flex flex-col transition-all duration-300 overflow-hidden`}>
        <Navigation 
          onNewFolder={onNewFolder}
          onNewTag={onNewTag}
          onBackToMain={onBackToMain}
          onOpenSettings={onOpenSettings}
          onDeleteFolder={onDeleteFolder}
          onDeleteTag={onDeleteTag}
          onRenameFolder={onRenameFolder}
          onRenameTag={onRenameTag}
        />
      </div>

      {/* 右侧内容区域 */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          currentView={currentView}
          onNewPrompt={onNewPrompt}
          onNewFolder={onNewFolder}
          onNewTag={onNewTag}
          onBackToMain={onBackToMain}
        />
        
        {/* 内容区域 */}
        <main className="flex-1 overflow-auto custom-scrollbar" style={{ overscrollBehavior: 'none' }}>
          <div className="animate-fade-in">
            {children}
          </div>
        </main>
        
        <Footer />
      </div>
    </div>
  );
}; 