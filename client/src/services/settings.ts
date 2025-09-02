import { settingsLogger } from './logger';

export interface AppSettings {
  autoSync: boolean;
  syncOnStartup: boolean;
  lastSyncTime?: string;
}

const SETTINGS_KEY = 'scholartrack-app-settings';

const DEFAULT_SETTINGS: AppSettings = {
  autoSync: false,
  syncOnStartup: true,
};

export class SettingsService {
  private static instance: SettingsService;
  private settings: AppSettings;

  private constructor() {
    this.settings = this.loadSettings();
  }

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  private loadSettings(): AppSettings {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to ensure all required fields exist
        const merged = { ...DEFAULT_SETTINGS, ...parsed };
        settingsLogger.info('Settings loaded from localStorage', merged);
        return merged;
      }
    } catch (error) {
      settingsLogger.error('Failed to load settings from localStorage', error instanceof Error ? error : new Error('Unknown error'));
    }
    
    settingsLogger.info('Using default settings');
    return { ...DEFAULT_SETTINGS };
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(this.settings));
      settingsLogger.debug('Settings saved to localStorage', this.settings);
    } catch (error) {
      settingsLogger.error('Failed to save settings to localStorage', error instanceof Error ? error : new Error('Unknown error'));
    }
  }

  public getSettings(): AppSettings {
    return { ...this.settings };
  }

  public updateSettings(updates: Partial<AppSettings>): void {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
    settingsLogger.info('Settings updated', updates);
  }

  public getAutoSync(): boolean {
    return this.settings.autoSync;
  }

  public setAutoSync(enabled: boolean): void {
    this.updateSettings({ autoSync: enabled });
  }

  public getSyncOnStartup(): boolean {
    return this.settings.syncOnStartup;
  }

  public setSyncOnStartup(enabled: boolean): void {
    this.updateSettings({ syncOnStartup: enabled });
  }

  public getLastSyncTime(): string | undefined {
    return this.settings.lastSyncTime;
  }

  public setLastSyncTime(time: string): void {
    this.updateSettings({ lastSyncTime: time });
  }

  public resetToDefaults(): void {
    this.settings = { ...DEFAULT_SETTINGS };
    this.saveSettings();
    settingsLogger.info('Settings reset to defaults');
  }
}

export const settingsService = SettingsService.getInstance();
