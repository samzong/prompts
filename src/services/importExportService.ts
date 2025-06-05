import { save, open } from '@tauri-apps/plugin-dialog';
import { readTextFile, writeTextFile } from '@tauri-apps/plugin-fs';
import { Prompt } from '../store';
import { storageService } from './storage';
import { promptService } from './promptService';

export interface ExportOptions {
  format: 'json' | 'csv' | 'markdown';
  includeMetadata?: boolean;
}

export interface ImportResult {
  success: boolean;
  importedCount: number;
  errors: string[];
  duplicates: number;
}

// 导入导出服务
export class ImportExportService {
  /**
   * 导出prompts到文件
   */
  async exportToFile(prompts: Prompt[], options: ExportOptions): Promise<boolean> {
    try {
      let content: string;
      let defaultFilename: string;
      let filters: Array<{ name: string; extensions: string[] }>;

      switch (options.format) {
        case 'json':
          content = await storageService.exportToJson(prompts);
          defaultFilename = `prompts-export-${this.getTimestamp()}.json`;
          filters = [{ name: 'JSON Files', extensions: ['json'] }];
          break;

        case 'csv':
          content = await storageService.exportToCsv(prompts);
          defaultFilename = `prompts-export-${this.getTimestamp()}.csv`;
          filters = [{ name: 'CSV Files', extensions: ['csv'] }];
          break;

        case 'markdown':
          content = await storageService.exportToMarkdown(prompts);
          defaultFilename = `prompts-export-${this.getTimestamp()}.md`;
          filters = [{ name: 'Markdown Files', extensions: ['md'] }];
          break;

        default:
          throw new Error(`Unsupported export format: ${options.format}`);
      }

      // 显示保存对话框
      const filePath = await save({
        defaultPath: defaultFilename,
        filters,
      });

      if (!filePath) {
        return false; // 用户取消了操作
      }

      // 写入文件
      await writeTextFile(filePath, content);
      return true;

    } catch (error) {
      console.error('Failed to export file:', error);
      throw new Error(`导出失败: ${(error as Error).message}`);
    }
  }

  /**
   * 从文件导入prompts
   */
  async importFromFile(): Promise<ImportResult> {
    try {
      // 显示文件选择对话框
      const filePath = await open({
        multiple: false,
        filters: [
          { name: 'JSON Files', extensions: ['json'] },
          { name: 'All Files', extensions: ['*'] },
        ],
      });

      if (!filePath) {
        return {
          success: false,
          importedCount: 0,
          errors: ['用户取消了导入操作'],
          duplicates: 0,
        };
      }

      // 读取文件内容
      const content = await readTextFile(filePath as string);
      
      // 解析JSON并导入
      return await this.importFromJson(content);

    } catch (error) {
      console.error('Failed to import file:', error);
      return {
        success: false,
        importedCount: 0,
        errors: [`导入失败: ${(error as Error).message}`],
        duplicates: 0,
      };
    }
  }

  /**
   * 从JSON字符串导入prompts
   */
  async importFromJson(jsonContent: string, mergeStrategy: 'replace' | 'merge' = 'merge'): Promise<ImportResult> {
    const errors: string[] = [];
    let importedCount = 0;
    let duplicates = 0;

    try {
      // 解析JSON
      const importedPrompts = await storageService.importFromJson(jsonContent);
      
      if (importedPrompts.length === 0) {
        return {
          success: false,
          importedCount: 0,
          errors: ['文件中没有找到有效的prompt数据'],
          duplicates: 0,
        };
      }

      // 检查重复项
      const existingPrompts = await promptService.getAllPrompts();
      const existingIds = new Set(existingPrompts.map(p => p.id));
      
      for (const prompt of importedPrompts) {
        if (existingIds.has(prompt.id)) {
          duplicates++;
        }
      }

      // 导入prompts
      importedCount = await promptService.importPrompts(importedPrompts, mergeStrategy);

      return {
        success: true,
        importedCount,
        errors,
        duplicates,
      };

    } catch (error) {
      console.error('Failed to import from JSON:', error);
      return {
        success: false,
        importedCount: 0,
        errors: [(error as Error).message],
        duplicates: 0,
      };
    }
  }

  /**
   * 创建备份
   */
  async createBackup(): Promise<boolean> {
    try {
      const backupFileName = await storageService.createBackup();
      console.log(`Backup created: ${backupFileName}`);
      return true;
    } catch (error) {
      console.error('Failed to create backup:', error);
      throw new Error(`创建备份失败: ${(error as Error).message}`);
    }
  }

  /**
   * 导出备份到指定位置
   */
  async exportBackup(): Promise<boolean> {
    try {
      const prompts = await promptService.getAllPrompts();
      const content = await storageService.exportToJson(prompts);
      
      const filePath = await save({
        defaultPath: `prompts-backup-${this.getTimestamp()}.json`,
        filters: [{ name: 'JSON Files', extensions: ['json'] }],
      });

      if (!filePath) {
        return false;
      }

      await writeTextFile(filePath, content);
      return true;

    } catch (error) {
      console.error('Failed to export backup:', error);
      throw new Error(`导出备份失败: ${(error as Error).message}`);
    }
  }

  /**
   * 获取格式化的时间戳
   */
  private getTimestamp(): string {
    const now = new Date();
    const isoString = now.toISOString();
    const datePart = isoString.split('T')[0];
    return datePart || now.toISOString().slice(0, 10);
  }

  /**
   * 验证JSON格式
   */
  validateJsonFormat(jsonContent: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    try {
      const data = JSON.parse(jsonContent);

      if (!Array.isArray(data)) {
        errors.push('JSON格式错误：根元素必须是数组');
        return { valid: false, errors };
      }

      data.forEach((item, index) => {
        if (!item.id) {
          errors.push(`第${index + 1}个项目缺少必需的 'id' 字段`);
        }
        if (!item.title) {
          errors.push(`第${index + 1}个项目缺少必需的 'title' 字段`);
        }
        if (!item.content) {
          errors.push(`第${index + 1}个项目缺少必需的 'content' 字段`);
        }
      });

      return { valid: errors.length === 0, errors };

    } catch (error) {
      errors.push(`JSON解析错误: ${(error as Error).message}`);
      return { valid: false, errors };
    }
  }

  /**
   * 获取导入预览信息
   */
  async getImportPreview(jsonContent: string): Promise<{
    valid: boolean;
    prompts: Partial<Prompt>[];
    errors: string[];
    duplicates: string[];
  }> {
    const validation = this.validateJsonFormat(jsonContent);
    
    if (!validation.valid) {
      return {
        valid: false,
        prompts: [],
        errors: validation.errors,
        duplicates: [],
      };
    }

    try {
      const importedPrompts = await storageService.importFromJson(jsonContent);
      const existingPrompts = await promptService.getAllPrompts();
      const existingIds = new Set(existingPrompts.map(p => p.id));
      
      const duplicates = importedPrompts
        .filter(p => existingIds.has(p.id))
        .map(p => p.title);

      return {
        valid: true,
        prompts: importedPrompts.map(p => ({
          id: p.id,
          title: p.title,
          tags: p.tags,
          createdAt: p.createdAt,
        })),
        errors: [],
        duplicates,
      };

    } catch (error) {
      return {
        valid: false,
        prompts: [],
        errors: [(error as Error).message],
        duplicates: [],
      };
    }
  }
}

// 创建全局服务实例
export const importExportService = new ImportExportService(); 