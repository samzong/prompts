import React from 'react';
import { useAppStore } from '../../store';

export const Navigation: React.FC = () => {
  const { prompts, selectedTags, setSelectedTags } = useAppStore();

  // 获取所有标签及其计数
  const allTags = prompts.reduce((acc, prompt) => {
    prompt.tags.forEach(tag => {
      acc[tag] = (acc[tag] || 0) + 1;
    });
    return acc;
  }, {} as Record<string, number>);

  const handleTagClick = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const clearAllTags = () => {
    setSelectedTags([]);
  };
  // Calculate uncategorized prompts count
  const uncategorizedCount = prompts.filter(prompt => prompt.tags.length === 0).length;

   return (
     <nav className="flex flex-col h-full bg-white dark:bg-gray-800">
       {/* All/Uncategorized section */}
       <div className="p-4 space-y-1">
         <button
           onClick={clearAllTags}
           className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md transition-colors ${
             selectedTags.length === 0
               ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
               : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
           }`}
         >
           <span>All</span>
           <span className="text-gray-500 dark:text-gray-400">({prompts.length})</span>
         </button>
         
        <button 
          onClick={() => setSelectedTags(['__uncategorized__'])}
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

      {/* Folder List 区域 */}
      <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
        <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
          Folder List
        </div>
        
        <div className="space-y-1">
          <button className="w-full flex items-center justify-between px-3 py-2 text-sm rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span>Folder 01</span>
            <span className="text-gray-500 dark:text-gray-400">(2)</span>
          </button>
        </div>
      </div>

      {/* Tag List 区域 */}
      <div className="flex-1 px-4 py-2 border-t border-gray-200 dark:border-gray-700 overflow-auto custom-scrollbar">
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Tag List
          </div>
          {selectedTags.length > 0 && (
            <button
              onClick={clearAllTags}
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        
        <div className="space-y-1">
          {Object.entries(allTags)
            .sort(([, a], [, b]) => b - a)
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
              <span>#{tag}</span>
              <span className="text-gray-500 dark:text-gray-400">({count})</span>
            </button>
          ))}
        </div>
      </div>

      {/* Settings 按钮 */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <button className="w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors">
          Settings
        </button>
      </div>
    </nav>
  );
}; 