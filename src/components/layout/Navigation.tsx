import React from 'react';
import { useAppStore } from '../../store';

interface NavigationProps {
  onNewFolder?: (() => void) | undefined;
  onNewTag?: (() => void) | undefined;
  onBackToMain?: (() => void) | undefined;
}

export const Navigation: React.FC<NavigationProps> = ({ onNewFolder, onNewTag, onBackToMain }) => {
  const { 
    prompts, 
    folders, 
    tags, 
    selectedTags, 
    selectedFolderId, 
    setSelectedTags, 
    setSelectedFolderId 
  } = useAppStore();

  // 获取所有标签及其计数
  const allTags = React.useMemo(() => {
    const tagCounts: Record<string, number> = {};
    
    // 首先添加所有创建的标签（即使未使用）
    tags.forEach(tag => {
      tagCounts[tag.name] = 0;
    });
    
    // 然后统计prompts中标签的使用次数
    prompts.forEach(prompt => {
      prompt.tags.forEach(tagName => {
        tagCounts[tagName] = (tagCounts[tagName] || 0) + 1;
      });
    });
    
    return tagCounts;
  }, [prompts, tags]);

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
    onBackToMain?.();
  };

  const handleFolderClick = (folderId: string | null) => {
    setSelectedFolderId(folderId);
    setSelectedTags([]); // 清除标签选择
    onBackToMain?.();
  };

  const clearAllFilters = () => {
    setSelectedTags([]);
    setSelectedFolderId(null);
    onBackToMain?.();
  };

  // 计算各种状态的提示词数量
  const uncategorizedCount = prompts.filter(prompt => prompt.tags.length === 0 && !prompt.folderId).length;
  const getFolderPromptCount = (folderId: string) => 
    prompts.filter(prompt => prompt.folderId === folderId).length;

  return (
    <nav className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* All/Uncategorized section */}
      <div className="p-4 space-y-1">
        <button
          onClick={clearAllFilters}
          className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
            selectedTags.length === 0 && !selectedFolderId
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <span>All</span>
          <span className="text-gray-500 dark:text-gray-400">({prompts.length})</span>
        </button>
        
        <button 
          onClick={() => {
            setSelectedTags(['__uncategorized__']);
            onBackToMain?.();
          }}
          className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
            selectedTags.includes('__uncategorized__')
              ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
        >
          <span>Uncategorized</span>
          <span className="text-gray-500 dark:text-gray-400">({uncategorizedCount})</span>
        </button>
      </div>

      {/* 文件夹列表区域 */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Folders
          </div>
          {onNewFolder && (
            <button
              onClick={onNewFolder}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Create new folder"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="space-y-1">
          {folders.length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 italic px-3 py-2">
              No folders yet
            </p>
          ) : (
            folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => handleFolderClick(folder.id)}
                className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                  selectedFolderId === folder.id
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="truncate">{folder.name}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  ({getFolderPromptCount(folder.id)})
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* 标签列表区域 */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 flex-1 overflow-y-auto">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Tags
          </div>
          {onNewTag && (
            <button
              onClick={onNewTag}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              title="Create new tag"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          )}
        </div>
        
        <div className="space-y-1">
          {Object.keys(allTags).length === 0 ? (
            <p className="text-xs text-gray-500 dark:text-gray-400 italic px-3 py-2">
              No tags yet
            </p>
          ) : (
            Object.entries(allTags)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([tag, count]) => (
                <button
                  key={tag}
                  onClick={() => handleTagClick(tag)}
                  className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
                    selectedTags.includes(tag)
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <span className="truncate">#{tag}</span>
                  <span className="text-gray-500 dark:text-gray-400">({count})</span>
                </button>
              ))
          )}
        </div>
      </div>
    </nav>
  );
}; 