import { invoke } from '@tauri-apps/api/core';
import { join, appDataDir } from '@tauri-apps/api/path';
import { readTextFile, writeTextFile, exists, mkdir } from '@tauri-apps/plugin-fs';
import { platform } from '@tauri-apps/plugin-os';
import type { AppSettings } from '../store';

export class SettingsService {
  private settingsPath: string | null = null;
  private initialized = false;

  /**
   * 初始化设置服务
   */
  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      const appDataPath = await appDataDir();
      const settingsDir = await join(appDataPath, 'prompts');
      this.settingsPath = await join(settingsDir, 'settings.json');

      // 确保目录存在
      if (!(await exists(settingsDir))) {
        await mkdir(settingsDir, { recursive: true });
      }

      this.initialized = true;
    } catch (error) {
      console.error('Failed to initialize settings service:', error);
      throw new Error('Settings service initialization failed');
    }
  }

  /**
   * 加载应用设置
   */
  async loadSettings(): Promise<AppSettings | null> {
    if (!this.initialized || !this.settingsPath) {
      throw new Error('Settings service not initialized');
    }

    try {
      if (await exists(this.settingsPath)) {
        const settingsData = await readTextFile(this.settingsPath);
        return JSON.parse(settingsData);
      }
      return null; // 设置文件不存在，返回 null 使用默认设置
    } catch (error) {
      console.error('Failed to load settings:', error);
      return null; // 加载失败时返回 null 使用默认设置
    }
  }

  /**
   * 保存应用设置
   */
  async saveSettings(settings: AppSettings): Promise<boolean> {
    if (!this.initialized || !this.settingsPath) {
      throw new Error('Settings service not initialized');
    }

    try {
      const settingsData = JSON.stringify(settings, null, 2);
      await writeTextFile(this.settingsPath, settingsData);
      return true;
    } catch (error) {
      console.error('Failed to save settings:', error);
      throw new Error('Failed to save settings');
    }
  }

  /**
   * 更新全局快捷键
   */
  async updateGlobalShortcut(shortcut: string, enabled: boolean): Promise<boolean> {
    try {
      // 调用 Tauri 后端更新全局快捷键
      await invoke('update_global_shortcut', { 
        shortcut: shortcut,
        enabled: enabled 
      });
      return true;
    } catch (error) {
      console.error('Failed to update global shortcut:', error);
      throw new Error('Failed to update global shortcut');
    }
  }

  /**
   * 验证快捷键格式
   */
  validateShortcut(shortcut: string): boolean {
    // 简单的快捷键格式验证
    const validModifiers = ['CommandOrControl', 'Cmd', 'Ctrl', 'Control', 'Alt', 'Option', 'Shift', 'Meta'];
    const validKeys = /^[a-zA-Z0-9]$|^F[1-9]|^F1[0-2]$|^(Space|Tab|Enter|Escape|Backspace|Delete|Up|Down|Left|Right|Home|End|PageUp|PageDown)$/;
    
    const parts = shortcut.split('+');
    if (parts.length < 2) return false;
    
    const key = parts[parts.length - 1];
    const modifiers = parts.slice(0, -1);
    
    // 检查按键是否存在且有效
    if (!key || !validKeys.test(key)) return false;
    
    // 检查修饰键是否有效
    return modifiers.every(modifier => validModifiers.includes(modifier));
  }

  /**
   * 格式化快捷键显示
   */
  async formatShortcutDisplay(shortcut: string): Promise<string> {
    const currentPlatform = await platform();
    const isMac = currentPlatform === 'macos';
    
    return shortcut
      .replace('CommandOrControl', isMac ? 'Cmd' : 'Ctrl')
      .replace('Cmd', '⌘')
      .replace('Ctrl', 'Ctrl')
      .replace('Alt', isMac ? '⌥' : 'Alt')
      .replace('Shift', '⇧')
      .replace('Meta', isMac ? '⌘' : 'Win')
      .replace('+', ' + ');
  }

  /**
   * 格式化快捷键显示（同步版本，用于 UI 组件）
   */
  formatShortcutDisplaySync(shortcut: string): string {
    // 使用 navigator.userAgent 或者其他方式来检测平台
    // 在 Tauri 中，我们可以通过 window.__TAURI__ 来判断
    const isMac = typeof window !== 'undefined' && 
                  window.navigator && 
                  window.navigator.platform.toLowerCase().includes('mac');
    
    return shortcut
      .replace('CommandOrControl', isMac ? 'Cmd' : 'Ctrl')
      .replace('Cmd', '⌘')
      .replace('Ctrl', 'Ctrl')
      .replace('Alt', isMac ? '⌥' : 'Alt')
      .replace('Shift', '⇧')
      .replace('Meta', isMac ? '⌘' : 'Win')
      .replace('+', ' + ');
  }
}

// 创建单例实例
export const settingsService = new SettingsService(); 