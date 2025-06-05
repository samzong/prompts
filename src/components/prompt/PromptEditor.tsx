import React, { useState, useEffect, useRef } from 'react';
import { Prompt, useAppStore } from '../../store';
import { EditorToolbar, StatusBar } from '../ui/Toolbar';
import { useKeyboardShortcuts, createCommonShortcuts } from '../../hooks/useKeyboardShortcuts';

interface PromptEditorProps {
  prompt?: Prompt;
  onSave: (prompt: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
  isEditing?: boolean;
}

export const PromptEditor: React.FC<PromptEditorProps> = ({
  prompt,
  onSave,
  onCancel,
  isEditing = false,
}) => {
  const [title, setTitle] = useState(prompt?.title || '');
  const [description, setDescription] = useState(prompt?.description || '');
  const [content, setContent] = useState(prompt?.content || '');
  const [tags, setTags] = useState<string[]>(prompt?.tags || []);
  const [variables, setVariables] = useState<string[]>(prompt?.variables || []);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { tags: allTagsFromStore } = useAppStore();

  // 获取可用的标签（排除已选择的）
  useEffect(() => {
    const availableTagNames = allTagsFromStore
      .map(tag => tag.name)
      .filter(tagName => !tags.includes(tagName));
    setAvailableTags(availableTagNames);
  }, [allTagsFromStore, tags]);

  // 自动检测变量
  useEffect(() => {
    const detectedVariables: string[] = [];
    const regex = /\{([^}]+)\}/g;
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      const variable = match[1]?.trim();
      if (variable && !detectedVariables.includes(variable)) {
        detectedVariables.push(variable);
      }
    }
    
    setVariables(detectedVariables);
  }, [content]);

  // 处理点击外部关闭下拉框和键盘事件
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowTagDropdown(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showTagDropdown) {
        setShowTagDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showTagDropdown]);

  const addTag = (tag: string) => {
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    // 不关闭下拉菜单，允许连续选择多个标签
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const toggleTagDropdown = () => {
    setShowTagDropdown(!showTagDropdown);
  };

  // 检测是否有未保存的更改
  useEffect(() => {
    const hasChanges = 
      title !== (prompt?.title || '') ||
      description !== (prompt?.description || '') ||
      content !== (prompt?.content || '') ||
      JSON.stringify(tags) !== JSON.stringify(prompt?.tags || []);
    
    setIsDirty(hasChanges);
  }, [title, description, content, tags, prompt]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      return;
    }

    const promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt'> = {
      title: title.trim(),
      description: description.trim(),
      content: content.trim(),
      tags,
      variables,
    };

    if (prompt?.folderId) {
      promptData.folderId = prompt.folderId;
    }

    try {
      setIsLoading(true);
      onSave(promptData);
    } finally {
      setIsLoading(false);
    }
  };

  const isValid = title.trim() && content.trim();

  // 键盘快捷键
  const shortcuts = createCommonShortcuts({
    onSave: isValid ? handleSave : undefined,
    onCancel: onCancel,
  });

  useKeyboardShortcuts(shortcuts);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* 固定工具栏 */}
      <EditorToolbar
        title={isEditing ? 'Edit Prompt' : 'Create New Prompt'}
        isEditing={isEditing === true}
        onCancel={onCancel}
        onSave={handleSave}
        canSave={isValid}
        isDirty={isDirty}
        loading={isLoading}
      />

      {/* 表单内容 */}
      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* 标题 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter a descriptive title for your prompt"
              required
            />
          </div>

          {/* 描述 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Optional description to help you remember what this prompt is for"
            />
          </div>

          {/* 标签选择器 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="space-y-3">
              {/* 已选择的标签 */}
              <div className="flex flex-wrap gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 min-h-[42px]">
                {tags.length > 0 ? (
                  tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-sm font-medium rounded"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(index)}
                        className="ml-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-gray-500 dark:text-gray-400 text-sm">No tags selected</span>
                )}
              </div>
              
              {/* 添加标签按钮和下拉菜单 */}
              <div className="relative">
                <button
                  type="button"
                  onClick={toggleTagDropdown}
                  disabled={availableTags.length === 0}
                  className={`inline-flex items-center px-3 py-2 border rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    availableTags.length > 0
                      ? 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600'
                      : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                  }`}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {availableTags.length > 0 ? 'Add Tag' : 'All tags selected'}
                  {availableTags.length > 0 && (
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
                  
                                     {/* 下拉菜单 */}
                   {showTagDropdown && (
                     <div
                       ref={dropdownRef}
                       className="absolute top-full left-0 z-50 mt-1 w-64 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-hidden"
                     >
                       {availableTags.length > 0 ? (
                         <>
                           <div className="max-h-40 overflow-auto">
                             {availableTags.map((tag) => (
                               <button
                                 key={tag}
                                 onClick={() => addTag(tag)}
                                 className="w-full text-left px-3 py-2 text-sm text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600 focus:bg-gray-100 dark:focus:bg-gray-600 focus:outline-none"
                               >
                                 <span className="flex items-center">
                                   <svg className="w-3 h-3 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                   </svg>
                                   {tag}
                                 </span>
                               </button>
                             ))}
                           </div>
                           <div className="border-t border-gray-200 dark:border-gray-600 p-2">
                             <button
                               onClick={() => setShowTagDropdown(false)}
                               className="w-full px-3 py-2 text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                             >
                               Done selecting tags
                             </button>
                           </div>
                         </>
                       ) : (
                         <div className="px-3 py-4 text-sm text-gray-500 dark:text-gray-400 text-center">
                           All available tags have been selected
                         </div>
                       )}
                     </div>
                   )}
                </div>
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Click "Add Tag" to select multiple tags from available options. Click the × to remove selected tags. Press Esc or click "Done" to close the tag selector.
            </p>
          </div>

          {/* 内容 - 使用 Textarea */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter your prompt content here. Use {variable_name} syntax for variables."
              className="w-full px-3 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none font-mono leading-relaxed"
              style={{
                minHeight: '300px',
                maxHeight: '500px'
              }}
              rows={12}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Use curly braces to define variables: {'{variable_name}'}. Variables will be automatically detected.
              </p>
              <div className="text-xs text-gray-400 dark:text-gray-500">
                {content.length} characters
              </div>
            </div>
          </div>

          {/* 检测到的变量 */}
          {variables.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Detected Variables
              </label>
              <div className="flex flex-wrap gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                {variables.map((variable) => (
                  <span
                    key={variable}
                    className="inline-flex items-center px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-sm font-medium rounded"
                  >
                    <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    {variable}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 底部状态栏 */}
      <StatusBar>
        <div className="flex items-center space-x-4">
          <span>{content.length} characters</span>
          <span>{content.split(/\s+/).filter(word => word.length > 0).length} words</span>
          <span>{content.split('\n').length} lines</span>
          {variables.length > 0 && (
            <span>{variables.length} variables detected</span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          {isDirty && (
            <span className="text-orange-600 dark:text-orange-400">Unsaved changes</span>
          )}
          <span>Plain text editor</span>
        </div>
      </StatusBar>
    </div>
  );
}; 