import { config } from '@vue/test-utils';
import { vi } from 'vitest';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

// Create Vuetify instance for testing that matches the main app configuration
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
          error: '#B00020',
          warning: '#FF9800',
          info: '#2196F3',
          success: '#4CAF50',
        },
      },
      dark: {
        colors: {
          background: '#121212',
          surface: '#1E1E1E',
          primary: '#90CAF9',
          secondary: '#B0BEC5',
          error: '#CF6679',
          warning: '#FFB74D',
          info: '#64B5F6',
          success: '#81C784',
        },
      },
    },
  },
  defaults: {
    VBtn: {
      variant: 'elevated',
    },
    VCard: {
      variant: 'elevated',
    },
    VTextField: {
      variant: 'outlined',
    },
    VSelect: {
      variant: 'outlined',
    },
    VTextarea: {
      variant: 'outlined',
    },
  },
});

// Mock IndexedDB for tests
const indexedDB = {
  open: vi.fn(),
  deleteDatabase: vi.fn(),
};

// Mock window.indexedDB
Object.defineProperty(window, 'indexedDB', {
  value: indexedDB,
  writable: true,
});

// Mock crypto.randomUUID
Object.defineProperty(window, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-123',
    getRandomValues: (arr: Uint8Array) => {
      for (let i = 0; i < arr.length; i++) {
        arr[i] = Math.floor(Math.random() * 256);
      }
      return arr;
    },
  },
  writable: true,
});

// Mock FileReader
global.FileReader = class {
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;
  onerror: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;
  onloadend: ((this: FileReader, ev: ProgressEvent<FileReader>) => void) | null = null;
  readyState: number = 0;
  result: string | ArrayBuffer | null = null;
  error: DOMException | null = null;
  
  readAsDataURL(_blob: Blob): void {
    this.readyState = 1; // LOADING
    void Promise.resolve().then(() => {
      this.readyState = 2; // DONE
      this.result = 'data:image/png;base64,test-base64-data';
      if (this.onload) {
        this.onload({
          target: { result: this.result },
        } as ProgressEvent<FileReader>);
      }
      if (this.onloadend) {
        this.onloadend({
          target: { result: this.result },
        } as ProgressEvent<FileReader>);
      }
    });
  }
  
  readAsText(_blob: Blob): void {
    this.readyState = 1; // LOADING
    void Promise.resolve().then(() => {
      this.readyState = 2; // DONE
      this.result = 'test-text-content';
      if (this.onload) {
        this.onload({
          target: { result: this.result },
        } as ProgressEvent<FileReader>);
      }
      if (this.onloadend) {
        this.onloadend({
          target: { result: this.result },
        } as ProgressEvent<FileReader>);
      }
    });
  }
};

// Mock fetch for API calls
global.fetch = vi.fn();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock MutationObserver
global.MutationObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  disconnect: vi.fn(),
  takeRecords: vi.fn(() => []),
}));

// Mock Performance API
Object.defineProperty(window, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => []),
    getEntries: vi.fn(() => []),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
    clearResourceTimings: vi.fn(),
    setResourceTimingBufferSize: vi.fn(),
    timeOrigin: Date.now(),
  },
  writable: true,
});

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
  writable: true,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  key: vi.fn(),
  length: 0,
};
Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
  writable: true,
});

// Mock URL API
global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
global.URL.revokeObjectURL = vi.fn();

// Configure Vue Test Utils with Vuetify
config.global.plugins = [vuetify];

// Configure global stubs for components that don't need full rendering
config.global.stubs = {
  'router-link': true,
  'router-view': true,
  'transition': true,
  'transition-group': true,
  'teleport': true,
};

// Configure global mocks
config.global.mocks = {
  $t: (key: string) => key, // Mock i18n
  $route: {
    path: '/',
    name: 'home',
    params: {},
    query: {},
  },
  $router: {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  },
};

// Mock Vue components for testing
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, unknown>;
  export default component;
}
