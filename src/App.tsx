import { useState } from 'react';
import { useAppStore } from './store';
import { MainLayout, PromptCard, PromptDetailView, PromptEditor } from './components';

// type ViewMode = 'grid' | 'list';
type CurrentView = 'main' | 'detail' | 'editor';

function App() {
  const { prompts, searchQuery, selectedPrompt, setSelectedPrompt, addPrompt, updatePrompt, deletePrompt, view, selectedTags } = useAppStore();
  const [currentView, setCurrentView] = useState<CurrentView>('main');
  const [editingPrompt, setEditingPrompt] = useState<any>(null);

  // 过滤prompts
  const filteredPrompts = prompts.filter(prompt => {
    // 按搜索查询过滤
    const query = searchQuery.toLowerCase();
    const matchesSearch = !query || (
      prompt.title.toLowerCase().includes(query) ||
      prompt.content.toLowerCase().includes(query) ||
      prompt.tags.some(tag => tag.toLowerCase().includes(query))
    );

    // 按选中的标签过滤
// Filter by selected tags
    const matchesTags = selectedTags.length === 0 || 
      (selectedTags.includes('__uncategorized__') 
        ? prompt.tags.length === 0
        : selectedTags.some(tag => prompt.tags.includes(tag)));
    return matchesSearch && matchesTags;
  });

  const handlePromptSelect = (prompt: any) => {
    setSelectedPrompt(prompt);
    setCurrentView('detail');
  };

  const handlePromptEdit = (prompt: any) => {
    setEditingPrompt(prompt);
    setCurrentView('editor');
  };

  const handlePromptCopy = (prompt: any) => {
    console.log('Copied prompt:', prompt.title);
  };

  const handlePromptDelete = (prompt: any) => {
    if (confirm('Are you sure you want to delete this prompt?')) {
      deletePrompt(prompt.id);
      if (selectedPrompt?.id === prompt.id) {
        setSelectedPrompt(null);
        setCurrentView('main');
      }
    }
  };

  const handleNewPrompt = () => {
    setEditingPrompt(null);
    setCurrentView('editor');
  };

  const handleNewFolder = () => {
    // TODO: 实现新建文件夹功能
    const folderName = prompt('Please enter folder name:');
    if (folderName && folderName.trim()) {
      console.log('Creating new folder:', folderName.trim());
      // 这里可以添加创建文件夹的逻辑
    }
  };

  const handleNewTag = () => {
    // TODO: 实现新建标签功能
    const tagName = prompt('Please enter tag name:');
    if (tagName && tagName.trim()) {
      console.log('Creating new tag:', tagName.trim());
      // 这里可以添加创建标签的逻辑
    }
  };

  const handleSavePrompt = (promptData: any) => {
    if (editingPrompt) {
      updatePrompt(editingPrompt.id, promptData);
    } else {
      const newPrompt = {
        id: Date.now().toString(),
        ...promptData,
        createdAt: new Date(),
        updatedAt: new Date(),
        usageCount: 0,
      };
      addPrompt(newPrompt);
    }
    setCurrentView('main');
    setEditingPrompt(null);
  };

  const handleCancelEdit = () => {
    setCurrentView('main');
    setEditingPrompt(null);
  };

  const handleCloseDetail = () => {
    setCurrentView('main');
    setSelectedPrompt(null);
  };

  // 导航功能：上一个/下一个 prompt
  const handlePreviousPrompt = () => {
    if (!selectedPrompt) return;
    
    const currentIndex = filteredPrompts.findIndex(p => p.id === selectedPrompt.id);
    if (currentIndex > 0) {
      const prevPrompt = filteredPrompts[currentIndex - 1];
      if (prevPrompt) {
        setSelectedPrompt(prevPrompt);
      }
    }
  };

  const handleNextPrompt = () => {
    if (!selectedPrompt) return;
    
    const currentIndex = filteredPrompts.findIndex(p => p.id === selectedPrompt.id);
    if (currentIndex < filteredPrompts.length - 1) {
      const nextPrompt = filteredPrompts[currentIndex + 1];
      if (nextPrompt) {
        setSelectedPrompt(nextPrompt);
      }
    }
  };

  const renderMainContent = () => {
    if (currentView === 'detail' && selectedPrompt) {
      return (
        <PromptDetailView
          prompt={selectedPrompt}
          onEdit={handlePromptEdit}
          onClose={handleCloseDetail}
          onCopy={handlePromptCopy}
        />
      );
    }

    if (currentView === 'editor') {
      return (
        <PromptEditor
          prompt={editingPrompt}
          onSave={handleSavePrompt}
          onCancel={handleCancelEdit}
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
              {searchQuery || selectedTags.length > 0 
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
    <MainLayout
      currentView={currentView}
      onNewPrompt={handleNewPrompt}
      onNewFolder={handleNewFolder}
      onNewTag={handleNewTag}
      onBack={handlePreviousPrompt}
      onNext={handleNextPrompt}
    >
      {renderMainContent()}
    </MainLayout>
  );
}

export default App;
