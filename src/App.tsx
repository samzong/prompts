import React, { useState, useEffect } from 'react';
import { MainLayout } from './components/layout/MainLayout';
import { PromptCard } from './components/prompt/PromptCard';
import { PromptDetailView } from './components/prompt/PromptDetailView';
import { PromptEditor } from './components/prompt/PromptEditor';
import { InputModal } from './components/ui/InputModal';
import { Toast } from './components/ui/Toast';
import { useAppStore } from './store';

// type ViewMode = 'grid' | 'list';
type CurrentView = 'main' | 'detail' | 'editor';

interface ModalState {
  type: 'folder' | 'tag' | null;
  isOpen: boolean;
}

function App() {
  const { 
    prompts, 
    toasts,
    searchQuery, 
    selectedPrompt, 
    selectedFolderId,
    initialized,
    setSelectedPrompt, 
    createPrompt, 
    updatePrompt, 
    deletePrompt, 
    copyPromptContent,
    createFolder,
    createTag,
    addToast,
    removeToast,
    initializeApp,
    view, 
    selectedTags 
  } = useAppStore();
  
  const [currentView, setCurrentView] = useState<CurrentView>('main');
  const [editingPrompt, setEditingPrompt] = useState<any>(null);
  const [modalState, setModalState] = useState<ModalState>({ type: null, isOpen: false });

  // 应用初始化
  useEffect(() => {
    const init = async () => {
      try {
        await initializeApp();
      } catch (error) {
        console.error('Failed to initialize app:', error);
      }
    };
    
    init();
  }, [initializeApp]);

  // 如果应用未初始化，显示加载界面
  if (!initialized) {
    return (
      <div className="flex items-center justify-center h-screen bg-white dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
            Loading Prompt Manager
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Initializing your prompt library...
          </p>
        </div>
      </div>
    );
  }

  // 过滤prompts
  const filteredPrompts = prompts.filter(prompt => {
    // 按搜索查询过滤
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || (
      prompt.title.toLowerCase().includes(query) ||
      prompt.content.toLowerCase().includes(query) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(query))
    );

    // 按选中的文件夹过滤
    const matchesFolder = !selectedFolderId || prompt.folderId === selectedFolderId;

    // 按选中的标签过滤
    let matchesTags = false;
    if (selectedTags.length === 0) {
      matchesTags = true; // 没有选择标签时显示所有
    } else if (selectedTags.includes('__uncategorized__')) {
      // 显示没有标签且没有文件夹的prompts
      matchesTags = prompt.tags.length === 0 && !prompt.folderId;
    } else {
      // 至少包含一个选中的标签
      matchesTags = selectedTags.some(tag => prompt.tags.includes(tag));
    }
        
    return matchesSearch && matchesFolder && matchesTags;
  });

  const handlePromptSelect = (prompt: any) => {
    setSelectedPrompt(prompt);
    setCurrentView('detail');
  };

  const handlePromptEdit = (prompt: any) => {
    setEditingPrompt(prompt);
    setCurrentView('editor');
  };

  const handlePromptCopy = async (prompt: any) => {
    try {
      const content = await copyPromptContent(prompt.id);
      await navigator.clipboard.writeText(content);
      addToast(`Copied "${prompt.title}" to clipboard`, 'success');
    } catch (error) {
      console.error('Failed to copy prompt:', error);
      addToast('Failed to copy prompt to clipboard', 'error');
    }
  };

  const handlePromptDelete = async (prompt: any) => {
    if (confirm('Are you sure you want to delete this prompt?')) {
      try {
        await deletePrompt(prompt.id);
        if (selectedPrompt?.id === prompt.id) {
          setSelectedPrompt(null);
          setCurrentView('main');
        }
        addToast(`Deleted prompt "${prompt.title}"`, 'success');
      } catch (error) {
        console.error('Failed to delete prompt:', error);
        addToast('Failed to delete prompt', 'error');
      }
    }
  };

  const handleNewPrompt = () => {
    setEditingPrompt(null);
    setCurrentView('editor');
  };

  const handleNewFolder = () => {
    setModalState({ type: 'folder', isOpen: true });
  };

  const handleNewTag = () => {
    setModalState({ type: 'tag', isOpen: true });
  };

  const handleModalConfirm = async (value: string) => {
    try {
      if (modalState.type === 'folder') {
        await createFolder({ name: value });
        addToast(`Created folder "${value}"`, 'success');
      } else if (modalState.type === 'tag') {
        await createTag({ name: value });
        addToast(`Created tag "${value}"`, 'success');
      }
      setModalState({ type: null, isOpen: false });
    } catch (error) {
      console.error(`Failed to create ${modalState.type}:`, error);
      addToast(`Failed to create ${modalState.type}`, 'error');
    }
  };

  const handleModalCancel = () => {
    setModalState({ type: null, isOpen: false });
  };

  const handlePromptSave = async (promptData: any) => {
    try {
      if (editingPrompt) {
        await updatePrompt(editingPrompt.id, promptData);
        addToast(`Updated prompt "${promptData.title}"`, 'success');
      } else {
        // 如果有选中的文件夹，添加到新prompt中
        if (selectedFolderId) {
          promptData.folderId = selectedFolderId;
        }
        await createPrompt(promptData);
        addToast(`Created prompt "${promptData.title}"`, 'success');
      }
      setEditingPrompt(null);
      setCurrentView('main');
    } catch (error) {
      console.error('Failed to save prompt:', error);
      addToast(`Failed to ${editingPrompt ? 'update' : 'create'} prompt`, 'error');
    }
  };

  const handlePromptEditCancel = () => {
    setEditingPrompt(null);
    setCurrentView('main');
  };

  const handleBackToMain = () => {
    setSelectedPrompt(null);
    setCurrentView('main');
  };

  // 移除了 handlePreviousPrompt 和 handleNextPrompt 函数
  // 因为我们现在只需要一个返回到主页的功能

  const renderMainContent = () => {
    // 详情视图
    if (currentView === 'detail' && selectedPrompt) {
      return (
        <PromptDetailView
          prompt={selectedPrompt}
          onEdit={() => handlePromptEdit(selectedPrompt)}
          onCopy={() => handlePromptCopy(selectedPrompt)}
          onClose={handleBackToMain}
        />
      );
    }

    // 编辑视图
    if (currentView === 'editor') {
      return (
        <PromptEditor
          prompt={editingPrompt}
          onSave={handlePromptSave}
          onCancel={handlePromptEditCancel}
          isEditing={!!editingPrompt}
        />
      );
    }

    // 主视图 - 简洁的卡片网格
    return (
      <div className="h-full p-6">
        {filteredPrompts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 dark:text-gray-400">
            <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-medium mb-2">No prompts found</h3>
            <p className="text-center mb-4">
              {searchQuery || selectedTags.length > 0 || selectedFolderId
                ? 'Try adjusting your search or filters'
                : 'Get started by creating your first prompt'
              }
            </p>
            <button
              onClick={handleNewPrompt}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Create New Prompt
            </button>
          </div>
        ) : (
          <div className={
            view === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
          }>
            {filteredPrompts.map((prompt) => (
              <PromptCard
                key={prompt.id}
                prompt={prompt}
                viewMode={view}
                isSelected={selectedPrompt?.id === prompt.id}
                onSelect={handlePromptSelect}
                onEdit={handlePromptEdit}
                onDelete={handlePromptDelete}
                onCopy={handlePromptCopy}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <MainLayout
        currentView={currentView}
        onNewPrompt={handleNewPrompt}
        onNewFolder={handleNewFolder}
        onNewTag={handleNewTag}
        onBackToMain={handleBackToMain}
      >
        {renderMainContent()}
      </MainLayout>

      {/* 创建文件夹/标签的模态对话框 */}
      <InputModal
        isOpen={modalState.isOpen}
        title={modalState.type === 'folder' ? 'Create New Folder' : 'Create New Tag'}
        placeholder={modalState.type === 'folder' ? 'Enter folder name' : 'Enter tag name'}
        description={modalState.type === 'folder' 
          ? 'Create a new folder to organize your prompts'
          : 'Create a new tag to categorize your prompts'
        }
        confirmText="Create"
        onConfirm={handleModalConfirm}
        onCancel={handleModalCancel}
      />

      {/* Toast通知 */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            message={toast.message}
            type={toast.type}
            duration={toast.duration || 3000}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </>
  );
}

export default App;
