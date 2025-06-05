import React, { useState } from 'react';
import { writeText } from '@tauri-apps/plugin-clipboard-manager';
import { Prompt } from '../../store';
import { DetailToolbar, StatusBar } from '../ui/Toolbar';
import { Button } from '../ui/Button';
import { useKeyboardShortcuts, createCommonShortcuts } from '../../hooks/useKeyboardShortcuts';

interface PromptDetailViewProps {
  prompt: Prompt;
  onEdit?: (prompt: Prompt) => void;
  onClose?: () => void;
  onCopy?: (prompt: Prompt) => void;
}

export const PromptDetailView: React.FC<PromptDetailViewProps> = ({
  prompt,
  onEdit,
  onClose,
  onCopy,
}) => {
  const [variableValues, setVariableValues] = useState<Record<string, string>>({});
  const [processedContent, setProcessedContent] = useState(prompt.content);
  const [isLoading, setIsLoading] = useState(false);

  // 处理变量替换
  const handleVariableChange = (variable: string, value: string) => {
    const newValues = { ...variableValues, [variable]: value };
    setVariableValues(newValues);
    
    // 生成处理后的内容
    let processed = prompt.content;
    Object.entries(newValues).forEach(([varName, varValue]) => {
      const regex = new RegExp(`\\{${varName}\\}`, 'g');
      processed = processed.replace(regex, varValue);
    });
    setProcessedContent(processed);
  };

  const handleCopyOriginal = async () => {
    try {
      setIsLoading(true);
      await writeText(prompt.content);
      onCopy?.(prompt);
    } catch (error) {
      console.error('Failed to copy content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyProcessed = async () => {
    try {
      setIsLoading(true);
      await writeText(processedContent);
    } catch (error) {
      console.error('Failed to copy processed content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 键盘快捷键
  const shortcuts = createCommonShortcuts({
    onCopy: handleCopyOriginal,
    onEdit: onEdit ? () => onEdit(prompt) : undefined,
    onCancel: onClose,
  });

  useKeyboardShortcuts(shortcuts);

  const highlightVariables = (text: string) => {
    if (!prompt.variables.length) return text;
    
    let highlightedText = text;
    prompt.variables.forEach(variable => {
      const regex = new RegExp(`\\{${variable}\\}`, 'g');
      highlightedText = highlightedText.replace(
        regex,
        `<span class="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-1 rounded font-medium">{${variable}}</span>`
      );
    });
    return highlightedText;
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800">
      {/* 固定工具栏 */}
      <DetailToolbar
        title={prompt.title}
        onEdit={onEdit ? () => onEdit(prompt) : undefined}
        onCopy={handleCopyOriginal}
        loading={isLoading}
      />

      {/* 描述区域 */}
      {prompt.description && (
        <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {prompt.description}
          </p>
        </div>
      )}

      {/* 内容区域 */}
      <div className="flex-1 overflow-auto p-6">
        {/* 动态布局：有变量时左右分栏，无变量时单栏全宽 */}
        <div className={prompt.variables.length > 0 ? 'grid grid-cols-1 lg:grid-cols-2 gap-8' : 'max-w-none'}>
          {/* 原始内容 */}
          <div className={prompt.variables.length > 0 ? '' : 'max-w-full'}>
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Content
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 font-mono text-sm leading-relaxed">
                <div 
                  dangerouslySetInnerHTML={{ 
                    __html: highlightVariables(prompt.content)
                  }}
                  className="whitespace-pre-wrap text-gray-800 dark:text-gray-200"
                />
              </div>
            </div>

            {/* 变量设置 */}
            {prompt.variables.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Variables
                </h3>
                <div className="space-y-4">
                  {prompt.variables.map((variable) => (
                    <div key={variable}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        {variable}
                      </label>
                      <input
                        type="text"
                        value={variableValues[variable] || ''}
                        onChange={(e) => handleVariableChange(variable, e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder={`Enter value for {${variable}}`}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 处理后内容 - 仅在有变量时显示 */}
          {prompt.variables.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Processed Content
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  }
                  onClick={handleCopyProcessed}
                  loading={isLoading}
                  tooltip="Copy Processed Content"
                >
                  Copy
                </Button>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-6 font-mono text-sm leading-relaxed">
                <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                  {processedContent}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 底部状态栏 */}
      <StatusBar>
        <div className="flex items-center space-x-4">
          <span>{prompt.content.length} characters</span>
          <span>{prompt.content.split(/\s+/).length} words</span>
          <span>{prompt.content.split('\n').length} lines</span>
          {prompt.variables.length > 0 && (
            <span>{prompt.variables.length} variables</span>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <span>Created: {prompt.createdAt.toLocaleDateString()}</span>
          <span>Updated: {prompt.updatedAt.toLocaleDateString()}</span>
        </div>
      </StatusBar>
    </div>
  );
}; 