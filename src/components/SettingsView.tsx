import { useState } from 'react';
import { useAppStore } from '../store';
import { ShortcutInput } from './ui/ShortcutInput';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

interface SettingItemProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

function SettingItem({ label, description, children }: SettingItemProps) {
  return (
    <div className="flex items-start justify-between py-3 first:pt-0 last:pb-0">
      <div className="flex-1 mr-4">
        <label className="text-sm font-medium text-gray-900 dark:text-white block mb-1">
          {label}
        </label>
        {description && (
          <p className="text-xs text-gray-600 dark:text-gray-400">
            {description}
          </p>
        )}
      </div>
      <div className="flex-shrink-0 w-64">
        {children}
      </div>
    </div>
  );
}

export function SettingsView() {
  const { settings, updateSettings, resetSettings, addToast } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);

  const handleShortcutChange = async (shortcut: string) => {
    try {
      setIsLoading(true);
      await updateSettings({
        globalShortcut: {
          ...settings.globalShortcut,
          quickPicker: shortcut
        }
      });
      addToast('Shortcut key settings updated', 'success');
    } catch (error) {
      console.error('Failed to update shortcut:', error);
      addToast('Failed to update shortcut key', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleShortcutToggle = async (enabled: boolean) => {
    try {
      setIsLoading(true);
      await updateSettings({
        globalShortcut: {
          ...settings.globalShortcut,
          enabled
        }
      });
      addToast(enabled ? 'Global Shortcut Enabled' : 'Global shortcut disabled', 'success');
    } catch (error) {
      console.error('Failed to toggle shortcut:', error);
      addToast('Failed to toggle shortcut state', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    try {
      await updateSettings({
        appearance: {
          ...settings.appearance,
          theme
        }
      });
      addToast('Theme settings updated', 'success');
    } catch (error) {
      console.error('Failed to update theme:', error);
      addToast('Failed to update theme', 'error');
    }
  };

  const handleGeneralSettingChange = async (key: keyof typeof settings.general, value: boolean) => {
    try {
      await updateSettings({
        general: {
          ...settings.general,
          [key]: value
        }
      });
      addToast('Settings updated', 'success');
    } catch (error) {
      console.error('Failed to update setting:', error);
      addToast('Failed to update setting', 'error');
    }
  };

  const handleResetSettings = async () => {
    if (confirm('Are you sure you want to reset all settings to default? This action cannot be undone.')) {
      try {
        setIsLoading(true);
        await resetSettings();
        addToast('Settings reset to default', 'success');
      } catch (error) {
        console.error('Failed to reset settings:', error);
        addToast('Failed to reset settings', 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* 页面标题 */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Settings
        </h1>
      </div>

      {/* 全局快捷键设置 */}
      <SettingsSection 
        title="Global Shortcut" 
        description="Configure system-wide shortcut keys to quickly open application features"
      >
        <SettingItem
          label="Enable Global Shortcut"
          description="Allow the application to register system-wide shortcut keys"
        >
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.globalShortcut.enabled}
              onChange={(e) => handleShortcutToggle(e.target.checked)}
              disabled={isLoading}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </SettingItem>

        <SettingItem
          label="Quick Picker Shortcut"
          description="Open the search overlay layer"
        >
          <ShortcutInput
            value={settings.globalShortcut.quickPicker}
            onChange={handleShortcutChange}
            disabled={!settings.globalShortcut.enabled || isLoading}
            placeholder="Click to set shortcut"
          />
        </SettingItem>
      </SettingsSection>

      {/* 外观设置 */}
      <SettingsSection 
        title="Appearance" 
        description="Customize the visual theme and interface settings of the application"
      >
        <SettingItem
          label="Theme"
          description="Select the display theme of the application"
        >
          <select
            value={settings.appearance.theme}
            onChange={(e) => handleThemeChange(e.target.value as 'light' | 'dark' | 'system')}
            className="
              w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md
              bg-white dark:bg-gray-800 
              text-gray-900 dark:text-white
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            "
          >
            <option value="system">Follow System</option>
            <option value="light">Light Theme</option>
            <option value="dark">Dark Theme</option>
          </select>
        </SettingItem>
      </SettingsSection>

      {/* 通用设置 */}
      <SettingsSection 
        title="General" 
        description="Manage the behavior and system integration settings of the application"
      >
        <SettingItem
          label="Start at Login"
          description="Automatically start the application when the system starts"
        >
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.general.startAtLogin}
              onChange={(e) => handleGeneralSettingChange('startAtLogin', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </SettingItem>

        <SettingItem
          label="Show in Dock"
          description="Show the application icon in the macOS Dock"
        >
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.general.showInDock}
              onChange={(e) => handleGeneralSettingChange('showInDock', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </SettingItem>

        <SettingItem
          label="Show Tray Icon"
          description="Show the tray icon in the system menu bar"
        >
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.general.showTrayIcon}
              onChange={(e) => handleGeneralSettingChange('showTrayIcon', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
          </label>
        </SettingItem>
      </SettingsSection>

      {/* 重置设置 */}
      <SettingsSection 
        title="Reset" 
        description="Reset all settings to default"
      >
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-900 dark:text-white font-medium mb-1">
              Reset All Settings
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              This will clear all custom settings and restore default values
            </p>
          </div>
          <button
            onClick={handleResetSettings}
            disabled={isLoading}
            className="
              px-4 py-2 text-sm font-medium text-red-700 bg-red-50 border border-red-200 rounded-md
              hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
              dark:bg-red-900/20 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/30
              disabled:opacity-50 disabled:cursor-not-allowed
              transition-colors
            "
          >
            {isLoading ? 'Resetting...' : 'Reset Settings'}
          </button>
        </div>
      </SettingsSection>
    </div>
  );
} 