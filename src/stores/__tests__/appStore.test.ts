import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useAppStore } from '../appStore';
import type { StyleSettings } from '../../types';

// Mock IndexedDB
const mockDB = {
  transaction: vi.fn(),
  add: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  close: vi.fn(),
};

const mockTransaction = {
  store: {
    getAll: vi.fn<[], Promise<unknown[]>>(),
    add: vi.fn<[unknown], Promise<unknown>>(),
    put: vi.fn<[unknown], Promise<unknown>>(),
    delete: vi.fn<[string], Promise<unknown>>(),
  },
};

// Mock openDB - moved after mockDB definition
vi.mock('idb', () => ({
  openDB: vi.fn().mockResolvedValue(mockDB),
  deleteDB: vi.fn().mockResolvedValue(undefined),
}));

describe('App Store', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setActivePinia(createPinia());
  });

  it('should initialize with default settings', () => {
    const store = useAppStore();
    expect(store.settings).toEqual({
      fontSize: 16,
      fontFamily: 'Arial',
      lineHeight: 1.5,
      letterSpacing: 0,
      textColor: '#333333',
      backgroundColor: '#FFFFFF',
      borderRadius: 8,
      borderWidth: 1,
      borderColor: '#E0E0E0',
      padding: 10,
      margin: 10,
      shadow: true,
      shadowColor: '#000000',
      shadowOpacity: 0.1,
      shadowOffsetX: 0,
      shadowOffsetY: 2,
      shadowBlur: 5,
    });
  });

  it('should load settings from IndexedDB', async () => {
    const store = useAppStore();
    const mockTransaction = {
      store: {
        getAll: vi.fn<[], Promise<StyleSettings[]>>().mockResolvedValue([
          {
            id: '1',
            fontSize: 18,
            fontFamily: 'Times New Roman',
            lineHeight: 1.6,
            letterSpacing: 0.5,
            textColor: '#666666',
            backgroundColor: '#F0F0F0',
            borderRadius: 10,
            borderWidth: 2,
            borderColor: '#CCCCCC',
            padding: 15,
            margin: 15,
            shadow: false,
            shadowColor: '#000000',
            shadowOpacity: 0.2,
            shadowOffsetX: 1,
            shadowOffsetY: 3,
            shadowBlur: 8,
          },
        ]),
        add: vi.fn<[StyleSettings], Promise<unknown>>(),
        put: vi.fn<[StyleSettings], Promise<unknown>>(),
        delete: vi.fn<[string], Promise<unknown>>(),
      },
    };

    vi.mock('idb', () => ({
      openDB: vi.fn().mockResolvedValue(mockDB),
      deleteDB: vi.fn().mockResolvedValue(undefined),
    }));

    await store.loadSettings();
    expect(store.settings).toEqual({
      fontSize: 18,
      fontFamily: 'Times New Roman',
      lineHeight: 1.6,
      letterSpacing: 0.5,
      textColor: '#666666',
      backgroundColor: '#F0F0F0',
      borderRadius: 10,
      borderWidth: 2,
      borderColor: '#CCCCCC',
      padding: 15,
      margin: 15,
      shadow: false,
      shadowColor: '#000000',
      shadowOpacity: 0.2,
      shadowOffsetX: 1,
      shadowOffsetY: 3,
      shadowBlur: 8,
    });
  });

  it('should save settings to IndexedDB', async () => {
    const store = useAppStore();
    const mockTransaction = {
      store: {
        add: vi.fn<[StyleSettings], Promise<unknown>>(),
      },
    };

    vi.mock('idb', () => ({
      openDB: vi.fn().mockResolvedValue(mockDB),
      deleteDB: vi.fn().mockResolvedValue(undefined),
    }));

    await store.saveSettings({
      fontSize: 20,
      fontFamily: 'Comic Sans',
      lineHeight: 1.7,
      letterSpacing: 1,
      textColor: '#999999',
      backgroundColor: '#E0E0E0',
      borderRadius: 12,
      borderWidth: 3,
      borderColor: '#BBBBBB',
      padding: 20,
      margin: 20,
      shadow: true,
      shadowColor: '#000000',
      shadowOpacity: 0.3,
      shadowOffsetX: 2,
      shadowOffsetY: 4,
      shadowBlur: 10,
    });

    expect(mockDB.transaction).toHaveBeenCalledWith('app-settings', 'readwrite');
    expect(mockTransaction.store.add).toHaveBeenCalledWith({
      fontSize: 20,
      fontFamily: 'Comic Sans',
      lineHeight: 1.7,
      letterSpacing: 1,
      textColor: '#999999',
      backgroundColor: '#E0E0E0',
      borderRadius: 12,
      borderWidth: 3,
      borderColor: '#BBBBBB',
      padding: 20,
      margin: 20,
      shadow: true,
      shadowColor: '#000000',
      shadowOpacity: 0.3,
      shadowOffsetX: 2,
      shadowOffsetY: 4,
      shadowBlur: 10,
    });
  });

  it('should delete settings from IndexedDB', async () => {
    const store = useAppStore();
    const mockTransaction = {
      store: {
        delete: vi.fn<[string], Promise<unknown>>(),
      },
    };

    vi.mock('idb', () => ({
      openDB: vi.fn().mockResolvedValue(mockDB),
      deleteDB: vi.fn().mockResolvedValue(undefined),
    }));

    await store.deleteSettings();
    expect(mockDB.transaction).toHaveBeenCalledWith('app-settings', 'readwrite');
    expect(mockTransaction.store.delete).toHaveBeenCalledWith('1');
  });
});
