import { check } from '@tauri-apps/plugin-updater';
import { relaunch } from '@tauri-apps/plugin-process';

export interface UpdateInfo {
  version: string;
  date: string;
  body: string;
}

export interface UpdateProgress {
  event: 'Started' | 'Progress' | 'Finished';
  data?: {
    contentLength?: number;
    chunkLength?: number;
  };
}

class UpdateService {
  private isChecking = false;
  private isUpdating = false;

  async checkForUpdates(): Promise<UpdateInfo | null> {
    if (this.isChecking) {
      console.log('已在检查更新中...');
      return null;
    }

    try {
      this.isChecking = true;
      console.log('正在检查更新...');
      
      const update = await check();
      
      if (update) {
        console.log(`发现更新: ${update.version} (${update.date})`);
        return {
          version: update.version,
          date: update.date ?? new Date().toISOString(),
          body: update.body ?? '无更新说明',
        };
      } else {
        console.log('当前已是最新版本');
        return null;
      }
    } catch (error) {
      console.error('检查更新失败:', error);
      throw error;
    } finally {
      this.isChecking = false;
    }
  }

  async downloadAndInstallUpdate(
    onProgress?: (progress: UpdateProgress) => void
  ): Promise<void> {
    if (this.isUpdating) {
      console.log('已在更新中...');
      return;
    }

    try {
      this.isUpdating = true;
      console.log('开始下载更新...');

      const update = await check();
      if (!update) {
        throw new Error('未找到可用更新');
      }

      let downloaded = 0;
      let contentLength = 0;

      await update.downloadAndInstall((event) => {
        switch (event.event) {
          case 'Started':
            contentLength = event.data.contentLength || 0;
            console.log(`开始下载 ${contentLength} 字节`);
            onProgress?.({
              event: 'Started',
              data: { contentLength }
            });
            break;
          case 'Progress':
            downloaded += event.data.chunkLength || 0;
            console.log(`已下载 ${downloaded} / ${contentLength}`);
            onProgress?.({
              event: 'Progress',
              data: { 
                chunkLength: event.data.chunkLength,
                contentLength 
              }
            });
            break;
          case 'Finished':
            console.log('下载完成');
            onProgress?.({
              event: 'Finished'
            });
            break;
        }
      });

      console.log('更新安装完成，准备重启应用...');
      await relaunch();
    } catch (error) {
      console.error('更新失败:', error);
      throw error;
    } finally {
      this.isUpdating = false;
    }
  }

  async silentUpdate(): Promise<boolean> {
    try {
      const updateInfo = await this.checkForUpdates();
      if (updateInfo) {
        console.log('静默更新：发现新版本，开始下载...');
        await this.downloadAndInstallUpdate();
        return true;
      }
      return false;
    } catch (error) {
      console.error('静默更新失败:', error);
      return false;
    }
  }

  get isCheckingForUpdates(): boolean {
    return this.isChecking;
  }

  get isUpdatingApp(): boolean {
    return this.isUpdating;
  }
}

export const updateService = new UpdateService();