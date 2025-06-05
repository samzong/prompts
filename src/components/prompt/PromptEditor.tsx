import React, { useState, useEffect, useRef } from 'react';
import { Prompt, useAppStore } from '../../store';
import CodeMirror from '@uiw/react-codemirror';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

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
  const [tagInput, setTagInput] = useState('');
  const [variables, setVariables] = useState<string[]>(prompt?.variables || []);
  const [showTagDropdown, setShowTagDropdown] = useState(false);
  const [filteredAvailableTags, setFilteredAvailableTags] = useState<string[]>([]);
  const [allTags, setAllTags] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const tagInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { tags: allTagsFromStore } = useAppStore();

  // 检测暗色模式
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setIsDarkMode(isDark);
    
    // 监听暗色模式变化
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === 'class') {
          const isDark = document.documentElement.classList.contains('dark');
          setIsDarkMode(isDark);
        }
      });
    });
    
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    });
    
    return () => observer.disconnect();
  }, []);

  // 获取所有可用的标签
  useEffect(() => {
    // 从 store 中的 tags 提取所有 tag 名称
    const availableTagNames = allTagsFromStore.map(tag => tag.name);
    setAllTags(availableTagNames);
  }, [allTagsFromStore]);

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

  // 过滤可用标签
  useEffect(() => {
    if (tagInput.trim()) {
      const filtered = allTags.filter(tag => 
        tag.toLowerCase().includes(tagInput.toLowerCase()) && 
        !tags.includes(tag)
      );
      setFilteredAvailableTags(filtered);
    } else {
      const filtered = allTags.filter(tag => !tags.includes(tag));
      setFilteredAvailableTags(filtered);
    }
  }, [tagInput, allTags, tags]);

  // 处理点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          tagInputRef.current && !tagInputRef.current.contains(event.target as Node)) {
        setShowTagDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleTagInputKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Backspace' && tagInput === '' && tags.length > 0) {
      removeTag(tags.length - 1);
    } else if (e.key === 'ArrowDown' && showTagDropdown && filteredAvailableTags.length > 0) {
      e.preventDefault();
      // 可以在这里添加键盘导航逻辑
    } else if (e.key === 'Escape') {
      setShowTagDropdown(false);
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTagInput(value);
    setShowTagDropdown(true);
  };

  const handleTagInputFocus = () => {
    setShowTagDropdown(true);
  };

  const addTag = (tagToAdd?: string) => {
    const trimmedTag = (tagToAdd || tagInput).trim().toLowerCase();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
    }
    setTagInput('');
    setShowTagDropdown(false);
    tagInputRef.current?.focus();
  };

  const removeTag = (index: number) => {
    setTags(tags.filter((_, i) => i !== index));
  };

  const selectTagFromDropdown = (tag: string) => {
    addTag(tag);
  };

  const handleSave = () => {
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

    onSave(promptData);
  };

  const isValid = title.trim() && content.trim();

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* 头部 */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          {isEditing ? 'Edit Prompt' : 'Create New Prompt'}
        </h2>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!isValid}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              isValid
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
            }`}
          >
            {isEditing ? 'Update' : 'Create'} Prompt
          </button>
        </div>
      </div>

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

          {/* 标签 - 带下拉列表 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tags
            </label>
            <div className="relative">
              <div className="flex flex-wrap gap-2 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 min-h-[42px]">
                {tags.map((tag, index) => (
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
                ))}
                <input
                  ref={tagInputRef}
                  type="text"
                  value={tagInput}
                  onChange={handleTagInputChange}
                  onKeyDown={handleTagInputKeyDown}
                  onFocus={handleTagInputFocus}
                  onBlur={() => {
                    // 延迟关闭下拉框，允许点击下拉项
                    setTimeout(() => {
                      if (!dropdownRef.current?.contains(document.activeElement)) {
                        setShowTagDropdown(false);
                        addTag();
                      }
                    }, 150);
                  }}
                  className="flex-1 min-w-[120px] bg-transparent outline-none text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder={tags.length === 0 ? "Add tags (press Enter or comma to add)" : "Add tag"}
                />
              </div>
              
              {/* 标签下拉列表 */}
              {showTagDropdown && filteredAvailableTags.length > 0 && (
                <div
                  ref={dropdownRef}
                  className="absolute top-full left-0 right-0 z-50 mt-1 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg max-h-48 overflow-auto"
                >
                  {filteredAvailableTags.slice(0, 10).map((tag) => (
                    <button
                      key={tag}
                      onClick={() => selectTagFromDropdown(tag)}
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
                  {filteredAvailableTags.length > 10 && (
                    <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-600">
                      {filteredAvailableTags.length - 10} more tags available. Type to filter.
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Press Enter or comma to add tags. Click on existing tags from the dropdown to select them.
            </p>
          </div>

          {/* 内容 - 使用 CodeMirror */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content * <span className="text-xs text-gray-500">(Markdown Supported)</span>
            </label>
            <div className="border border-gray-300 dark:border-gray-600 rounded-md overflow-hidden">
              <CodeMirror
                value={content}
                onChange={(value) => setContent(value)}
                extensions={[markdown()]}
                {...(isDarkMode ? { theme: oneDark } : {})}
                placeholder="Enter your prompt content here. Use {variable_name} syntax for variables."
                className="text-sm"
                style={{
                  minHeight: '300px',
                  maxHeight: '500px'
                }}
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: true,
                  dropCursor: false,
                  allowMultipleSelections: false,
                  indentOnInput: true,
                  bracketMatching: true,
                  closeBrackets: true,
                  autocompletion: true,
                  highlightSelectionMatches: false
                }}
              />
            </div>
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
    </div>
  );
}; 