import { create } from 'zustand';
import { promptService } from '../services/promptService';
import { importExportService, ImportResult, ExportOptions } from '../services/importExportService';
import { settingsService } from '../services/settingsService';

// Prompt数据类型定义
export interface Prompt {
  id: string;
  title: string;
  content: string;
  description?: string;
  variables: string[];
  tags: string[];
  folderId?: string;
  createdAt: Date;
  updatedAt: Date;
  usageCount?: number;
}

// 文件夹数据类型定义
export interface Folder {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// 标签数据类型定义
export interface Tag {
  id: string;
  name: string;
  description?: string;
  color?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Toast通知类型定义
export interface ToastNotification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

// 设置类型定义
export interface AppSettings {
  globalShortcut: {
    quickPicker: string; // 快捷键字符串，如 "CommandOrControl+Shift+P"
    enabled: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
  };
  general: {
    startAtLogin: boolean;
    showInDock: boolean;
    showTrayIcon: boolean;
  };
  quickPicker: {
    position: {
      x: number;
      y: number;
    } | null; // null 表示使用默认居中位置
  };
}

// 应用状态接口
interface AppState {
  prompts: Prompt[];
  folders: Folder[];
  tags: Tag[];
  toasts: ToastNotification[];
  selectedPrompt: Prompt | null;
  selectedFolderId: string | null;
  searchQuery: string;
  selectedTags: string[];
  isQuickPickerOpen: boolean;
  isMainWindowOpen: boolean;
  view: 'grid' | 'list';
  isSidebarCollapsed: boolean;
  loading: boolean;
  initialized: boolean;
  settings: AppSettings;
  
  // 数据操作方法
  initializeApp: () => Promise<void>;
  loadPrompts: () => Promise<void>;
  loadFolders: () => Promise<void>;
  loadTags: () => Promise<void>;
  createPrompt: (promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'variables' | 'usageCount'>) => Promise<Prompt>;
  updatePrompt: (id: string, updates: Partial<Prompt>) => Promise<Prompt | null>;
  deletePrompt: (id: string) => Promise<boolean>;
  deletePrompts: (ids: string[]) => Promise<number>;
  copyPromptContent: (id: string, variables?: Record<string, string>) => Promise<string>;
  searchPrompts: (query: string, tags?: string[]) => Promise<Prompt[]>;
  getAllTags: () => Promise<string[]>;
  
  // 文件夹管理方法
  createFolder: (folderData: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Folder>;
  updateFolder: (id: string, updates: Partial<Folder>) => Promise<Folder | null>;
  deleteFolder: (id: string) => Promise<boolean>;
  
  // 标签管理方法
  createTag: (tagData: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Tag>;
  updateTag: (id: string, updates: Partial<Tag>) => Promise<Tag | null>;
  deleteTag: (id: string) => Promise<boolean>;
  
  // Toast通知方法
  addToast: (message: string, type: 'success' | 'error' | 'info', duration?: number) => void;
  removeToast: (id: string) => void;
  
  // 设置管理方法
  loadSettings: () => Promise<void>;
  updateSettings: (updates: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
  
  getStatistics: () => Promise<{
    totalPrompts: number;
    totalTags: number;
    totalFolders: number;
    totalUsage: number;
    recentlyCreated: number;
    recentlyUpdated: number;
  }>;
  
  // 导入导出方法
  exportToFile: (options: ExportOptions) => Promise<boolean>;
  importFromFile: () => Promise<ImportResult>;
  createBackup: () => Promise<boolean>;
  exportBackup: () => Promise<boolean>;
  
  // UI状态方法
  setPrompts: (prompts: Prompt[]) => void;
  setFolders: (folders: Folder[]) => void;
  setTags: (tags: Tag[]) => void;
  setSelectedPrompt: (prompt: Prompt | null) => void;
  setSelectedFolderId: (folderId: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  setView: (view: 'grid' | 'list') => void;
  setLoading: (loading: boolean) => void;
  toggleSidebar: () => void;
  toggleQuickPicker: () => void;
  toggleMainWindow: () => void;
}

// 默认设置
const defaultSettings: AppSettings = {
  globalShortcut: {
    quickPicker: 'CommandOrControl+Shift+P',
    enabled: true,
  },
  appearance: {
    theme: 'system',
  },
  general: {
    startAtLogin: false,
    showInDock: true,
    showTrayIcon: true,
  },
  quickPicker: {
    position: null, // 默认居中
  },
};

// 创建store
export const useAppStore = create<AppState>((set, get) => ({
  // 初始状态
  prompts: [],
  folders: [],
  tags: [],
  toasts: [],
  selectedPrompt: null,
  selectedFolderId: null,
  searchQuery: '',
  selectedTags: [],
  isQuickPickerOpen: false,
  isMainWindowOpen: false,
  view: 'grid',
  isSidebarCollapsed: false,
  loading: false,
  initialized: false,
  settings: defaultSettings,
  
  // 初始化应用
  initializeApp: async () => {
    if (get().initialized) return;
    
    set({ loading: true });
    try {
      await promptService.initialize();
      await get().loadSettings();
      await get().loadPrompts();
      await get().loadFolders();
      await get().loadTags();
      set({ initialized: true });
    } catch (error) {
      console.error('Failed to initialize app:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  // 加载所有prompts
  loadPrompts: async () => {
    set({ loading: true });
    try {
      const prompts = await promptService.getAllPrompts();
      set({ prompts });
    } catch (error) {
      console.error('Failed to load prompts:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  // 加载所有folders
  loadFolders: async () => {
    set({ loading: true });
    try {
      const folders = await promptService.getAllFolders();
      set({ folders });
    } catch (error) {
      console.error('Failed to load folders:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  // 加载所有tags
  loadTags: async () => {
    set({ loading: true });
    try {
      const tags = await promptService.getAllTags();
      set({ tags });
    } catch (error) {
      console.error('Failed to load tags:', error);
    } finally {
      set({ loading: false });
    }
  },
  
  // 创建新prompt
  createPrompt: async (promptData) => {
    set({ loading: true });
    try {
      const newPrompt = await promptService.createPrompt(promptData);
      set((state) => ({ 
        prompts: [...state.prompts, newPrompt] 
      }));
      return newPrompt;
    } catch (error) {
      console.error('Failed to create prompt:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  // 更新prompt
  updatePrompt: async (id, updates) => {
    set({ loading: true });
    try {
      const updatedPrompt = await promptService.updatePrompt(id, updates);
      if (updatedPrompt) {
        set((state) => ({
          prompts: state.prompts.map(p => 
            p.id === id ? updatedPrompt : p
          ),
          selectedPrompt: state.selectedPrompt?.id === id ? updatedPrompt : state.selectedPrompt
        }));
      }
      return updatedPrompt;
    } catch (error) {
      console.error('Failed to update prompt:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  // 删除单个prompt
  deletePrompt: async (id) => {
    set({ loading: true });
    try {
      const success = await promptService.deletePrompt(id);
      if (success) {
        set((state) => ({
          prompts: state.prompts.filter(p => p.id !== id),
          selectedPrompt: state.selectedPrompt?.id === id ? null : state.selectedPrompt
        }));
      }
      return success;
    } catch (error) {
      console.error('Failed to delete prompt:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  // 批量删除prompts
  deletePrompts: async (ids) => {
    set({ loading: true });
    try {
      const deletedCount = await promptService.deletePrompts(ids);
      if (deletedCount > 0) {
        set((state) => ({
          prompts: state.prompts.filter(p => !ids.includes(p.id)),
          selectedPrompt: state.selectedPrompt && ids.includes(state.selectedPrompt.id) 
            ? null : state.selectedPrompt
        }));
      }
      return deletedCount;
    } catch (error) {
      console.error('Failed to delete prompts:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  // 复制prompt内容
  copyPromptContent: async (id, variables) => {
    try {
      return await promptService.copyPromptContent(id, variables);
    } catch (error) {
      console.error('Failed to copy prompt content:', error);
      throw error;
    }
  },
  
  // 搜索prompts
  searchPrompts: async (query, tags) => {
    try {
      return await promptService.searchPrompts(query, tags);
    } catch (error) {
      console.error('Failed to search prompts:', error);
      return [];
    }
  },
  
  // 获取所有标签
  getAllTags: async () => {
    try {
      return await promptService.getAllTagNames();
    } catch (error) {
      console.error('Failed to get tags:', error);
      return [];
    }
  },
  
  // 获取统计信息
  getStatistics: async () => {
    try {
      const state = get();
      return {
        totalPrompts: state.prompts.length,
        totalTags: state.tags.length,
        totalFolders: state.folders.length,
        totalUsage: state.prompts.reduce((acc, prompt) => acc + (prompt.usageCount || 0), 0),
        recentlyCreated: state.prompts.filter(
          prompt => Date.now() - prompt.createdAt.getTime() < 7 * 24 * 60 * 60 * 1000
        ).length,
        recentlyUpdated: state.prompts.filter(
          prompt => Date.now() - prompt.updatedAt.getTime() < 7 * 24 * 60 * 60 * 1000
        ).length,
      };
    } catch (error) {
      console.error('Failed to get statistics:', error);
      return {
        totalPrompts: 0,
        totalTags: 0,
        totalFolders: 0,
        totalUsage: 0,
        recentlyCreated: 0,
        recentlyUpdated: 0,
      };
    }
  },
  
  // 导出到文件
  exportToFile: async (options) => {
    try {
      const { prompts } = get();
      return await importExportService.exportToFile(prompts, options);
    } catch (error) {
      console.error('Failed to export file:', error);
      throw error;
    }
  },
  
  // 从文件导入
  importFromFile: async () => {
    set({ loading: true });
    try {
      const result = await importExportService.importFromFile();
      if (result.success) {
        // 重新加载prompts
        await get().loadPrompts();
      }
      return result;
    } catch (error) {
      console.error('Failed to import file:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },
  
  // 创建备份
  createBackup: async () => {
    try {
      return await importExportService.createBackup();
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw error;
    }
  },
  
  // 导出备份
  exportBackup: async () => {
    try {
      return await importExportService.exportBackup();
    } catch (error) {
      console.error('Failed to export backup:', error);
      throw error;
    }
  },
  
  // UI状态管理
  setPrompts: (prompts) => set({ prompts }),
  setFolders: (folders) => set({ folders }),
  setTags: (tags) => set({ tags }),
  setSelectedPrompt: (prompt) => set({ selectedPrompt: prompt }),
  setSelectedFolderId: (folderId) => set({ selectedFolderId: folderId }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedTags: (tags) => set({ selectedTags: tags }),
  setView: (view) => set({ view }),
  setLoading: (loading) => set({ loading }),
  toggleSidebar: () => set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  toggleQuickPicker: () => set((state) => ({ isQuickPickerOpen: !state.isQuickPickerOpen })),
  toggleMainWindow: () => set((state) => ({ isMainWindowOpen: !state.isMainWindowOpen })),

  // 创建文件夹
  createFolder: async (folderData) => {
    set({ loading: true });
    try {
      const newFolder = await promptService.createFolder(folderData);
      set((state) => ({ 
        folders: [...state.folders, newFolder] 
      }));
      return newFolder;
    } catch (error) {
      console.error('Failed to create folder:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // 更新文件夹
  updateFolder: async (id, updates) => {
    set({ loading: true });
    try {
      const updatedFolder = await promptService.updateFolder(id, updates);
      if (updatedFolder) {
        set((state) => ({
          folders: state.folders.map(folder =>
            folder.id === id ? updatedFolder : folder
          )
        }));
      }
      return updatedFolder;
    } catch (error) {
      console.error('Failed to update folder:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // 删除文件夹
  deleteFolder: async (id) => {
    set({ loading: true });
    try {
      const success = await promptService.deleteFolder(id);
      if (success) {
        set((state) => ({
          folders: state.folders.filter(folder => folder.id !== id),
          // 同时清理该文件夹下的prompts的folderId
          prompts: state.prompts.map(prompt => {
            if (prompt.folderId === id) {
              const { folderId, ...rest } = prompt;
              return rest;
            }
            return prompt;
          })
        }));
      }
      return success;
    } catch (error) {
      console.error('Failed to delete folder:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // 创建标签
  createTag: async (tagData) => {
    set({ loading: true });
    try {
      const newTag = await promptService.createTag(tagData);
      set((state) => ({ 
        tags: [...state.tags, newTag] 
      }));
      return newTag;
    } catch (error) {
      console.error('Failed to create tag:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // 更新标签
  updateTag: async (id, updates) => {
    set({ loading: true });
    try {
      const updatedTag = await promptService.updateTag(id, updates);
      if (updatedTag) {
        set((state) => ({
          tags: state.tags.map(tag =>
            tag.id === id ? updatedTag : tag
          )
        }));
      }
      return updatedTag;
    } catch (error) {
      console.error('Failed to update tag:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // 删除标签
  deleteTag: async (id) => {
    set({ loading: true });
    try {
      const success = await promptService.deleteTag(id);
      if (success) {
        const tagToDelete = get().tags.find(t => t.id === id);
        if (tagToDelete) {
          set((state) => ({
            tags: state.tags.filter(tag => tag.id !== id),
            // 从prompts中移除该标签
            prompts: state.prompts.map(prompt => ({
              ...prompt,
              tags: prompt.tags.filter(tag => tag !== tagToDelete.name)
            }))
          }));
        }
      }
      return success;
    } catch (error) {
      console.error('Failed to delete tag:', error);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // Toast通知管理
  addToast: (message, type, duration = 3000) => {
    const toast: ToastNotification = {
      id: crypto.randomUUID(),
      message,
      type,
      duration,
    };
    set((state) => ({
      toasts: [...state.toasts, toast]
    }));
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter(toast => toast.id !== id)
    }));
  },

  // 设置管理方法
  loadSettings: async () => {
    try {
      await settingsService.initialize();
      const savedSettings = await settingsService.loadSettings();
      if (savedSettings) {
        set({ settings: savedSettings });
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  },

  updateSettings: async (updates) => {
    try {
      const currentSettings = get().settings;
      // 深度合并嵌套对象
      const newSettings = {
        ...currentSettings,
        ...updates,
        // 特殊处理嵌套对象
        ...(updates.quickPicker && {
          quickPicker: {
            ...currentSettings.quickPicker,
            ...updates.quickPicker
          }
        }),
        ...(updates.globalShortcut && {
          globalShortcut: {
            ...currentSettings.globalShortcut,
            ...updates.globalShortcut
          }
        }),
        ...(updates.appearance && {
          appearance: {
            ...currentSettings.appearance,
            ...updates.appearance
          }
        }),
        ...(updates.general && {
          general: {
            ...currentSettings.general,
            ...updates.general
          }
        })
      };
      
      console.log('Updating settings:', { currentSettings, updates, newSettings }); // 调试日志
      
      // 如果更新了全局快捷键设置，需要同时更新后端
      if (updates.globalShortcut) {
        await settingsService.updateGlobalShortcut(
          newSettings.globalShortcut.quickPicker,
          newSettings.globalShortcut.enabled
        );
      }
      
      await settingsService.saveSettings(newSettings);
      set({ settings: newSettings });
      
      console.log('Settings updated successfully'); // 调试日志
    } catch (error) {
      console.error('Failed to update settings:', error);
      throw error;
    }
  },

  resetSettings: async () => {
    try {
      const resetSettings = { ...defaultSettings };
      await settingsService.saveSettings(resetSettings);
      
      // 重置全局快捷键
      await settingsService.updateGlobalShortcut(
        resetSettings.globalShortcut.quickPicker,
        resetSettings.globalShortcut.enabled
      );
      
      set({ settings: resetSettings });
    } catch (error) {
      console.error('Failed to reset settings:', error);
      throw error;
    }
  },
})); 