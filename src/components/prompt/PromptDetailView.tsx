import React, { useState } from 'react';
import { Prompt } from '../../store';

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

  const handleCopyOriginal = () => {
    navigator.clipboard.writeText(prompt.content);
    onCopy?.(prompt);
  };

  const handleCopyProcessed = () => {
    navigator.clipboard.writeText(processedContent);
  };

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
      {/* 头部 */}
      <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {prompt.title}
          </h2>
          {prompt.description && (
            <p className="text-gray-600 dark:text-gray-400">
              {prompt.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={handleCopyOriginal}
            className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Original
          </button>
          
          {onEdit && (
            <button
              onClick={() => onEdit(prompt)}
              className="flex items-center px-3 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
          )}
          
          {onClose && (
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* 内容区域 */}
      <div className="flex-1 overflow-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左侧：原始内容 */}
          <div>
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                Original Content
              </h3>
              <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4 font-mono text-sm leading-relaxed">
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
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                  Variables
                </h3>
                <div className="space-y-3">
                  {prompt.variables.map((variable) => (
                    <div key={variable}>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
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

          {/* 右侧：处理后内容 */}
          {prompt.variables.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Processed Content
                </h3>
                <button
                  onClick={handleCopyProcessed}
                  className="flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Copy
                </button>
              </div>
              <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 font-mono text-sm leading-relaxed">
                <div className="whitespace-pre-wrap text-gray-800 dark:text-gray-200">
                  {processedContent}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 底部元信息 */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 标签 */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Tags</h4>
            <div className="flex flex-wrap gap-2">
              {prompt.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded"
                >
                  {tag}
                </span>
              ))}
              {prompt.tags.length === 0 && (
                <span className="text-sm text-gray-400 dark:text-gray-500">No tags</span>
              )}
            </div>
          </div>

          {/* 变量 */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Variables</h4>
            <div className="text-sm text-gray-900 dark:text-white">
              {prompt.variables.length > 0 ? (
                <div className="flex flex-wrap gap-1">
                  {prompt.variables.map((variable, index) => (
                    <span key={variable}>
                      <code className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-1 rounded">
                        {variable}
                      </code>
                      {index < prompt.variables.length - 1 && ', '}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-gray-400 dark:text-gray-500">No variables</span>
              )}
            </div>
          </div>

          {/* 统计 */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Statistics</h4>
            <div className="text-sm text-gray-900 dark:text-white space-y-1">
              <div>{prompt.content.length} characters</div>
              <div>{prompt.content.split(/\s+/).length} words</div>
              <div>{prompt.content.split('\n').length} lines</div>
            </div>
          </div>

          {/* 时间信息 */}
          <div>
            <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Timestamps</h4>
            <div className="text-sm text-gray-900 dark:text-white space-y-1">
              <div>Created: {prompt.createdAt.toLocaleDateString()}</div>
              <div>Updated: {prompt.updatedAt.toLocaleDateString()}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 