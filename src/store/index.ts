import { create } from 'zustand';

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
}

// 应用状态接口
interface AppState {
  prompts: Prompt[];
  selectedPrompt: Prompt | null;
  searchQuery: string;
  selectedTags: string[];
  isQuickPickerOpen: boolean;
  isMainWindowOpen: boolean;
  
  // 操作方法
  setPrompts: (prompts: Prompt[]) => void;
  addPrompt: (prompt: Prompt) => void;
  updatePrompt: (id: string, prompt: Partial<Prompt>) => void;
  deletePrompt: (id: string) => void;
  setSelectedPrompt: (prompt: Prompt | null) => void;
  setSearchQuery: (query: string) => void;
  setSelectedTags: (tags: string[]) => void;
  toggleQuickPicker: () => void;
  toggleMainWindow: () => void;
}

// 创建store
export const useAppStore = create<AppState>((set) => ({
  prompts: [],
  selectedPrompt: null,
  searchQuery: '',
  selectedTags: [],
  isQuickPickerOpen: false,
  isMainWindowOpen: false,
  
  setPrompts: (prompts) => set({ prompts }),
  
  addPrompt: (prompt) => set((state) => ({ 
    prompts: [...state.prompts, prompt] 
  })),
  
  updatePrompt: (id, updatedPrompt) => set((state) => ({
    prompts: state.prompts.map(p => 
      p.id === id ? { ...p, ...updatedPrompt, updatedAt: new Date() } : p
    )
  })),
  
  deletePrompt: (id) => set((state) => ({
    prompts: state.prompts.filter(p => p.id !== id),
    selectedPrompt: state.selectedPrompt?.id === id ? null : state.selectedPrompt
  })),
  
  setSelectedPrompt: (prompt) => set({ selectedPrompt: prompt }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSelectedTags: (tags) => set({ selectedTags: tags }),
  toggleQuickPicker: () => set((state) => ({ isQuickPickerOpen: !state.isQuickPickerOpen })),
  toggleMainWindow: () => set((state) => ({ isMainWindowOpen: !state.isMainWindowOpen })),
})); 