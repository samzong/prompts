import { useAppStore } from './store';

function App() {
  const { prompts, searchQuery, setSearchQuery } = useAppStore();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* 应用标题栏 */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Prompt Snippets Manager
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            System-level prompt management for macOS
          </p>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="container mx-auto px-6 py-8">
        {/* 搜索栏 */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search prompts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-12 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white"
            />
            <svg
              className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>

        {/* Prompt列表/网格 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prompts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <div className="text-gray-400 dark:text-gray-500 mb-4">
                <svg
                  className="mx-auto w-16 h-16"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No prompts yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first prompt to get started
              </p>
              <button className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
                <svg
                  className="w-5 h-5 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                New Prompt
              </button>
            </div>
          ) : (
            prompts.map((prompt) => (
              <div
                key={prompt.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  {prompt.title}
                </h3>
                {prompt.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                    {prompt.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 mb-3">
                  {prompt.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs font-medium rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  Updated {prompt.updatedAt.toLocaleDateString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default App;
