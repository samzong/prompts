import React, { useState } from 'react';
import { useAppStore } from '../../store';
import { ContextMenu } from '../ui/ContextMenu';

interface NavigationProps {
  onNewFolder?: (() => void) | undefined;
  onNewTag?: (() => void) | undefined;
  onBackToMain?: (() => void) | undefined;
  onDeleteFolder?: ((folderId: string, folderName: string) => void) | undefined;
  onDeleteTag?: ((tagId: string, tagName: string) => void) | undefined;
  onRenameFolder?: ((folderId: string, currentName: string) => void) | undefined;
  onRenameTag?: ((tagId: string, currentName: string) => void) | undefined;
}

interface ContextMenuState {
  isOpen: boolean;
  position: { x: number; y: number };
  type: 'folder' | 'tag' | null;
  item: any;
}

export const Navigation: React.FC<NavigationProps> = ({ 
  onNewFolder, 
  onNewTag, 
  onBackToMain,
  onDeleteFolder,
  onDeleteTag,
  onRenameFolder,
  onRenameTag
}) => {
  const { 
    prompts, 
    folders, 
    tags, 
    selectedTags, 
    selectedFolderId, 
    setSelectedTags, 
    setSelectedFolderId 
  } = useAppStore();

  const [contextMenu, setContextMenu] = useState<ContextMenuState>({
    isOpen: false,
    position: { x: 0, y: 0 },
    type: null,
    item: null
  });

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

  // 处理右键菜单
  const handleContextMenu = (
    e: React.MouseEvent,
    type: 'folder' | 'tag',
    item: any
  ) => {
    e.preventDefault();
    e.stopPropagation();
    
    setContextMenu({
      isOpen: true,
      position: { x: e.clientX, y: e.clientY },
      type,
      item
    });
  };

  const closeContextMenu = () => {
    setContextMenu(prev => ({ ...prev, isOpen: false }));
  };

  // 获取右键菜单项
  const getContextMenuItems = () => {
    if (!contextMenu.type || !contextMenu.item) return [];

    const items = [];

    // 重命名选项
    if (contextMenu.type === 'folder' && onRenameFolder) {
      items.push({
        label: 'Rename',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ),
        onClick: () => onRenameFolder(contextMenu.item.id, contextMenu.item.name)
      });
    } else if (contextMenu.type === 'tag' && onRenameTag) {
      items.push({
        label: 'Rename',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        ),
        onClick: () => {
          const tagObj = tags.find(t => t.name === contextMenu.item.name);
          if (tagObj) {
            onRenameTag(tagObj.id, tagObj.name);
          }
        }
      });
    }

    // 删除选项
    if (contextMenu.type === 'folder' && onDeleteFolder) {
      items.push({
        label: 'Delete',
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        ),
        onClick: () => onDeleteFolder(contextMenu.item.id, contextMenu.item.name),
        danger: true
      });
    } else if (contextMenu.type === 'tag' && onDeleteTag) {
      const tagObj = tags.find(t => t.name === contextMenu.item.name);
      if (tagObj) {
        items.push({
          label: 'Delete',
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          ),
          onClick: () => onDeleteTag(tagObj.id, tagObj.name),
          danger: true
        });
      }
    }

    return items;
  };

  // 计算各种状态的提示词数量
  const uncategorizedCount = prompts.filter(prompt => prompt.tags.length === 0 && !prompt.folderId).length;
  const getFolderPromptCount = (folderId: string) => 
    prompts.filter(prompt => prompt.folderId === folderId).length;

  return (
    <>
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
                  onContextMenu={(e) => handleContextMenu(e, 'folder', folder)}
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
                    onContextMenu={(e) => handleContextMenu(e, 'tag', { name: tag, count })}
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

      {/* 右键菜单 */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        position={contextMenu.position}
        items={getContextMenuItems()}
        onClose={closeContextMenu}
      />
    </>
  );
}; 