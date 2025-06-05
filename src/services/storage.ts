import { BaseDirectory, exists, readTextFile, writeTextFile, mkdir } from '@tauri-apps/plugin-fs';
import { Prompt, Folder, Tag } from '../store';

// 数据文件配置
const DATA_DIR = 'prompts-data';
const PROMPTS_FILE = `${DATA_DIR}/prompts.json`;
const FOLDERS_FILE = `${DATA_DIR}/folders.json`;
const TAGS_FILE = `${DATA_DIR}/tags.json`;
const BACKUP_DIR = `${DATA_DIR}/backups`;

// 数据存储服务类
export class StorageService {
  /**
   * 初始化存储目录
   */
  async initialize(): Promise<void> {
    try {
      // 检查数据目录是否存在，不存在则创建
      const dataDirExists = await exists(DATA_DIR, { baseDir: BaseDirectory.AppData });
      if (!dataDirExists) {
        await mkdir(DATA_DIR, { baseDir: BaseDirectory.AppData, recursive: true });
      }

      // 检查备份目录是否存在，不存在则创建
      const backupDirExists = await exists(BACKUP_DIR, { baseDir: BaseDirectory.AppData });
      if (!backupDirExists) {
        await mkdir(BACKUP_DIR, { baseDir: BaseDirectory.AppData, recursive: true });
      }

      // 检查各数据文件是否存在，不存在则创建空文件
      const promptsFileExists = await exists(PROMPTS_FILE, { baseDir: BaseDirectory.AppData });
      if (!promptsFileExists) {
        await this.savePrompts([]);
      }

      const foldersFileExists = await exists(FOLDERS_FILE, { baseDir: BaseDirectory.AppData });
      if (!foldersFileExists) {
        await this.saveFolders([]);
      }

      const tagsFileExists = await exists(TAGS_FILE, { baseDir: BaseDirectory.AppData });
      if (!tagsFileExists) {
        await this.saveTags([]);
      }
    } catch (error) {
      console.error('Failed to initialize storage:', error);
      throw new Error('存储初始化失败');
    }
  }

  /**
   * 加载prompts
   */
  async loadPrompts(): Promise<Prompt[]> {
    try {
      const content = await readTextFile(PROMPTS_FILE, { baseDir: BaseDirectory.AppData });
      const data = JSON.parse(content);
      
      return data.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to load prompts:', error);
      return [];
    }
  }

  /**
   * 保存prompts
   */
  async savePrompts(prompts: Prompt[]): Promise<void> {
    try {
      const content = JSON.stringify(prompts, null, 2);
      await writeTextFile(PROMPTS_FILE, content, { baseDir: BaseDirectory.AppData });
    } catch (error) {
      console.error('Failed to save prompts:', error);
      throw new Error('保存prompts失败');
    }
  }

  /**
   * 加载folders
   */
  async loadFolders(): Promise<Folder[]> {
    try {
      const content = await readTextFile(FOLDERS_FILE, { baseDir: BaseDirectory.AppData });
      const data = JSON.parse(content);
      
      return data.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to load folders:', error);
      return [];
    }
  }

  /**
   * 保存folders
   */
  async saveFolders(folders: Folder[]): Promise<void> {
    try {
      const content = JSON.stringify(folders, null, 2);
      await writeTextFile(FOLDERS_FILE, content, { baseDir: BaseDirectory.AppData });
    } catch (error) {
      console.error('Failed to save folders:', error);
      throw new Error('保存folders失败');
    }
  }

  /**
   * 加载tags
   */
  async loadTags(): Promise<Tag[]> {
    try {
      const content = await readTextFile(TAGS_FILE, { baseDir: BaseDirectory.AppData });
      const data = JSON.parse(content);
      
      return data.map((item: any) => ({
        ...item,
        createdAt: new Date(item.createdAt),
        updatedAt: new Date(item.updatedAt),
      }));
    } catch (error) {
      console.error('Failed to load tags:', error);
      return [];
    }
  }

  /**
   * 保存tags
   */
  async saveTags(tags: Tag[]): Promise<void> {
    try {
      const content = JSON.stringify(tags, null, 2);
      await writeTextFile(TAGS_FILE, content, { baseDir: BaseDirectory.AppData });
    } catch (error) {
      console.error('Failed to save tags:', error);
      throw new Error('保存tags失败');
    }
  }

  /**
   * 创建备份
   */
  async createBackup(): Promise<string> {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `backup-${timestamp}.json`;
      const backupFilePath = `${BACKUP_DIR}/${backupFileName}`;
      
      const prompts = await this.loadPrompts();
      const folders = await this.loadFolders();
      const tags = await this.loadTags();
      
      const backupData = {
        timestamp: new Date().toISOString(),
        version: '1.0',
        data: {
          prompts,
          folders,
          tags,
        }
      };
      
      const content = JSON.stringify(backupData, null, 2);
      await writeTextFile(backupFilePath, content, { baseDir: BaseDirectory.AppData });
      
      return backupFileName;
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw new Error('创建备份失败');
    }
  }

  /**
   * 导出为JSON
   */
  async exportToJson(prompts: Prompt[]): Promise<string> {
    return JSON.stringify(prompts, null, 2);
  }

  /**
   * 从JSON导入
   */
  async importFromJson(jsonContent: string): Promise<Prompt[]> {
    try {
      const data = JSON.parse(jsonContent);
      
      // 验证数据结构
      if (!Array.isArray(data)) {
        throw new Error('Invalid data format: expected array');
      }

      return data.map((item: any, index: number) => {
        if (!item.id || !item.title || !item.content) {
          throw new Error(`Invalid prompt at index ${index}: missing required fields`);
        }

        return {
          id: item.id,
          title: item.title,
          content: item.content,
          description: item.description || '',
          variables: Array.isArray(item.variables) ? item.variables : [],
          tags: Array.isArray(item.tags) ? item.tags : [],
          folderId: item.folderId,
          createdAt: item.createdAt ? new Date(item.createdAt) : new Date(),
          updatedAt: item.updatedAt ? new Date(item.updatedAt) : new Date(),
          usageCount: item.usageCount || 0,
        };
      });
    } catch (error) {
      console.error('Failed to import from JSON:', error);
      throw new Error('JSON导入失败: ' + (error as Error).message);
    }
  }

  /**
   * 导出为CSV
   */
  async exportToCsv(prompts: Prompt[]): Promise<string> {
    const headers = ['ID', 'Title', 'Content', 'Description', 'Variables', 'Tags', 'Created At', 'Updated At', 'Usage Count'];
    const csvRows = [headers.join(',')];

    for (const prompt of prompts) {
      const row = [
        this.escapeCsvField(prompt.id),
        this.escapeCsvField(prompt.title),
        this.escapeCsvField(prompt.content),
        this.escapeCsvField(prompt.description || ''),
        this.escapeCsvField(prompt.variables.join(';')),
        this.escapeCsvField(prompt.tags.join(';')),
        this.escapeCsvField(prompt.createdAt.toISOString()),
        this.escapeCsvField(prompt.updatedAt.toISOString()),
        this.escapeCsvField(String(prompt.usageCount || 0)),
      ];
      csvRows.push(row.join(','));
    }

    return csvRows.join('\n');
  }

  /**
   * 导出为Markdown
   */
  async exportToMarkdown(prompts: Prompt[]): Promise<string> {
    const lines = ['# Prompt Snippets Export', ''];
    
    for (const prompt of prompts) {
      lines.push(`## ${prompt.title}`);
      lines.push('');
      
      if (prompt.description) {
        lines.push(`**Description:** ${prompt.description}`);
        lines.push('');
      }
      
      if (prompt.tags.length > 0) {
        lines.push(`**Tags:** ${prompt.tags.map(tag => `\`${tag}\``).join(', ')}`);
        lines.push('');
      }
      
      if (prompt.variables.length > 0) {
        lines.push(`**Variables:** ${prompt.variables.map(variable => `\`${variable}\``).join(', ')}`);
        lines.push('');
      }
      
      lines.push('**Content:**');
      lines.push('```');
      lines.push(prompt.content);
      lines.push('```');
      lines.push('');
      lines.push(`*Created: ${prompt.createdAt.toLocaleDateString()} | Updated: ${prompt.updatedAt.toLocaleDateString()} | Usage: ${prompt.usageCount || 0}*`);
      lines.push('');
      lines.push('---');
      lines.push('');
    }

    return lines.join('\n');
  }

  /**
   * CSV字段转义
   */
  private escapeCsvField(field: string): string {
    if (field.includes(',') || field.includes('"') || field.includes('\n')) {
      return `"${field.replace(/"/g, '""')}"`;
    }
    return field;
  }
}

// 创建全局存储服务实例
export const storageService = new StorageService(); 