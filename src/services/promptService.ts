import { Prompt, Folder, Tag } from '../store';
import { StorageService, storageService } from './storage';

// 生成唯一ID的工具函数
function generateId(): string {
  return `prompt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// 提取文本中的变量
function extractVariables(content: string): string[] {
  const variables: string[] = [];
  const regex = /\{([^}]+)\}/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const variable = match[1]?.trim();
    if (variable && !variables.includes(variable)) {
      variables.push(variable);
    }
  }

  return variables;
}

// Prompt数据操作服务
export class PromptService {
  private prompts: Prompt[] = [];
  private folders: Folder[] = [];
  private tags: Tag[] = [];
  private initialized = false;

  /**
   * 初始化服务，加载数据
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await storageService.initialize();
      this.prompts = await storageService.loadPrompts();
      this.folders = await storageService.loadFolders();
      this.tags = await storageService.loadTags();
      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize prompt service:', error);
      throw error;
    }
  }

  /**
   * 获取所有prompts
   */
  async getAllPrompts(): Promise<Prompt[]> {
    await this.initialize();
    return [...this.prompts];
  }

  /**
   * 获取所有folders
   */
  async getAllFolders(): Promise<Folder[]> {
    await this.initialize();
    return [...this.folders];
  }

  /**
   * 获取所有tags
   */
  async getAllTags(): Promise<Tag[]> {
    await this.initialize();
    return [...this.tags];
  }

  /**
   * 创建新prompt
   */
  async createPrompt(promptData: Omit<Prompt, 'id' | 'createdAt' | 'updatedAt' | 'variables' | 'usageCount'>): Promise<Prompt> {
    await this.initialize();

    const variables = extractVariables(promptData.content);
    const newPrompt: Prompt = {
      id: crypto.randomUUID(),
      ...promptData,
      variables,
      usageCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.prompts.push(newPrompt);
    await storageService.savePrompts(this.prompts);

    return newPrompt;
  }

  /**
   * 创建新folder
   */
  async createFolder(folderData: Omit<Folder, 'id' | 'createdAt' | 'updatedAt'>): Promise<Folder> {
    await this.initialize();

    const newFolder: Folder = {
      id: crypto.randomUUID(),
      ...folderData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.folders.push(newFolder);
    await storageService.saveFolders(this.folders);

    return newFolder;
  }

  /**
   * 创建新tag
   */
  async createTag(tagData: Omit<Tag, 'id' | 'createdAt' | 'updatedAt'>): Promise<Tag> {
    await this.initialize();

    const newTag: Tag = {
      id: crypto.randomUUID(),
      ...tagData,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.tags.push(newTag);
    await storageService.saveTags(this.tags);

    return newTag;
  }

  /**
   * 更新prompt
   */
  async updatePrompt(id: string, updates: Partial<Omit<Prompt, 'id' | 'createdAt'>>): Promise<Prompt | null> {
    await this.initialize();

    const index = this.prompts.findIndex(p => p.id === id);
    if (index === -1) return null;

    // 如果内容有更新，重新提取变量
    const updatedContent = updates.content || this.prompts[index].content;
    const variables = extractVariables(updatedContent);

    const updatedPrompt: Prompt = {
      ...this.prompts[index],
      ...updates,
      variables,
      updatedAt: new Date(),
    };

    this.prompts[index] = updatedPrompt;
    await storageService.savePrompts(this.prompts);

    return updatedPrompt;
  }

  /**
   * 更新folder
   */
  async updateFolder(id: string, updates: Partial<Omit<Folder, 'id' | 'createdAt'>>): Promise<Folder | null> {
    await this.initialize();

    const index = this.folders.findIndex(f => f.id === id);
    if (index === -1) return null;

    const updatedFolder: Folder = {
      ...this.folders[index],
      ...updates,
      updatedAt: new Date(),
    };

    this.folders[index] = updatedFolder;
    await storageService.saveFolders(this.folders);

    return updatedFolder;
  }

  /**
   * 更新tag
   */
  async updateTag(id: string, updates: Partial<Omit<Tag, 'id' | 'createdAt'>>): Promise<Tag | null> {
    await this.initialize();

    const index = this.tags.findIndex(t => t.id === id);
    if (index === -1) return null;

    const updatedTag: Tag = {
      ...this.tags[index],
      ...updates,
      updatedAt: new Date(),
    };

    this.tags[index] = updatedTag;
    await storageService.saveTags(this.tags);

    return updatedTag;
  }

  /**
   * 删除prompt
   */
  async deletePrompt(id: string): Promise<boolean> {
    await this.initialize();

    const index = this.prompts.findIndex(p => p.id === id);
    if (index === -1) return false;

    this.prompts.splice(index, 1);
    await storageService.savePrompts(this.prompts);

    return true;
  }

  /**
   * 删除folder
   */
  async deleteFolder(id: string): Promise<boolean> {
    await this.initialize();

    const index = this.folders.findIndex(f => f.id === id);
    if (index === -1) return false;

    // 移除文件夹
    this.folders.splice(index, 1);
    await storageService.saveFolders(this.folders);

    // 清理使用该文件夹的prompts
    this.prompts = this.prompts.map(prompt => {
      if (prompt.folderId === id) {
        const { folderId, ...rest } = prompt;
        return { ...rest, updatedAt: new Date() };
      }
      return prompt;
    });
    await storageService.savePrompts(this.prompts);

    return true;
  }

  /**
   * 删除tag
   */
  async deleteTag(id: string): Promise<boolean> {
    await this.initialize();

    const index = this.tags.findIndex(t => t.id === id);
    if (index === -1) return false;

    const tagToDelete = this.tags[index];
    
    // 移除标签
    this.tags.splice(index, 1);
    await storageService.saveTags(this.tags);

    // 从prompts中移除该标签
    this.prompts = this.prompts.map(prompt => ({
      ...prompt,
      tags: prompt.tags.filter(tag => tag !== tagToDelete.name),
      updatedAt: new Date(),
    }));
    await storageService.savePrompts(this.prompts);

    return true;
  }

  /**
   * 批量删除prompts
   */
  async deletePrompts(ids: string[]): Promise<number> {
    await this.initialize();

    const initialLength = this.prompts.length;
    this.prompts = this.prompts.filter(p => !ids.includes(p.id));
    const deletedCount = initialLength - this.prompts.length;

    if (deletedCount > 0) {
      await storageService.savePrompts(this.prompts);
    }

    return deletedCount;
  }

  /**
   * 复制prompt内容，支持变量替换
   */
  async copyPromptContent(id: string, variables?: Record<string, string>): Promise<string> {
    await this.initialize();

    const prompt = this.prompts.find(p => p.id === id);
    if (!prompt) throw new Error('Prompt not found');

    // 增加使用计数
    prompt.usageCount = (prompt.usageCount || 0) + 1;
    await storageService.savePrompts(this.prompts);

    let content = prompt.content;

    // 如果提供了变量值，进行替换
    if (variables) {
      Object.entries(variables).forEach(([key, value]) => {
        const regex = new RegExp(`\\{${key}\\}`, 'g');
        content = content.replace(regex, value);
      });
    }

    return content;
  }

  /**
   * 搜索prompts
   */
  async searchPrompts(query: string, tags?: string[]): Promise<Prompt[]> {
    await this.initialize();

    const lowerQuery = query.toLowerCase();
    
    return this.prompts.filter(prompt => {
      const matchesQuery = !query || (
        prompt.title.toLowerCase().includes(lowerQuery) ||
        prompt.content.toLowerCase().includes(lowerQuery) ||
        (prompt.description && prompt.description.toLowerCase().includes(lowerQuery))
      );

      const matchesTags = !tags || tags.length === 0 || 
        tags.some(tag => prompt.tags.includes(tag));

      return matchesQuery && matchesTags;
    });
  }

  /**
   * 获取所有标签名称
   */
  async getAllTagNames(): Promise<string[]> {
    await this.initialize();

    const tagSet = new Set<string>();
    this.prompts.forEach(prompt => {
      prompt.tags.forEach(tag => tagSet.add(tag));
    });

    return Array.from(tagSet).sort();
  }

  /**
   * 获取统计信息
   */
  async getStatistics(): Promise<{
    totalPrompts: number;
    totalTags: number;
    totalFolders: number;
    totalUsage: number;
    recentlyCreated: number;
    recentlyUpdated: number;
  }> {
    await this.initialize();

    const totalUsage = this.prompts.reduce((acc, prompt) => acc + (prompt.usageCount || 0), 0);
    
    const now = Date.now();
    const weekAgo = now - (7 * 24 * 60 * 60 * 1000);
    
    const recentlyCreated = this.prompts.filter(
      prompt => prompt.createdAt.getTime() > weekAgo
    ).length;
    
    const recentlyUpdated = this.prompts.filter(
      prompt => prompt.updatedAt.getTime() > weekAgo
    ).length;

    return {
      totalPrompts: this.prompts.length,
      totalTags: this.tags.length,
      totalFolders: this.folders.length,
      totalUsage,
      recentlyCreated,
      recentlyUpdated,
    };
  }
}

// 导出单例实例
export const promptService = new PromptService(); 