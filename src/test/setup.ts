import { config } from '@vue/test-utils';
import { vi } from 'vitest';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

// Create Vuetify instance for tests
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          background: '#F5F5F5',
          surface: '#FFFFFF',
          primary: '#1976D2',
          secondary: '#424242',
        },
      },
    },
  },
});

// Mock IndexedDB for tests
const mockIndexedDB = {
  open: vi.fn(() => ({
    result: {
      createObjectStore: vi.fn(),
      objectStoreNames: [],
      transaction: vi.fn(() => ({
        objectStore: vi.fn(() => ({
          add: vi.fn(),
          get: vi.fn(),
          put: vi.fn(),
          delete: vi.fn(),
          clear: vi.fn(),
          getAll: vi.fn(),
        })),
      })),
    },
    onupgradeneeded: null,
    onsuccess: null,
    onerror: null,
  })),
  deleteDatabase: vi.fn(() => ({
    result: {},
    onsuccess: null,
    onerror: null,
  })),
};

// Mock IDBRequest
global.IDBRequest = class {
  result: any = null;
  error: any = null;
  readyState: string = 'done';
  source: any = null;
  transaction: any = null;
  onsuccess: ((this: IDBRequest, ev: Event) => void) | null = null;
  onerror: ((this: IDBRequest, ev: Event) => void) | null = null;
};

// Mock window.indexedDB
Object.defineProperty(window, 'indexedDB', {
  value: mockIndexedDB,
  writable: true,
});

// Mock crypto.randomUUID
Object.defineProperty(window, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-123',
  },
  writable: true,
});

// Mock fetch for API calls
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
) as any;

// Mock FileReader
global.FileReader = class {
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;
  readAsDataURL(_blob: Blob): void {
    // Use Promise.resolve().then() instead of setTimeout for immediate async execution
    void Promise.resolve().then(() => {
      if (this.onload) {
        this.onload({
          target: { result: 'data:image/png;base64,test-base64-data' },
        } as ProgressEvent<FileReader>);
      }
    });
  }
};

// Mock Vue components for testing
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, unknown>;
  export default component;
}

// Configure Vue Test Utils with Vuetify
config.global.plugins = [vuetify];

// Remove stubs since we're using Vuetify properly
config.global.stubs = {};
