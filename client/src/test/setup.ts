import { config } from '@vue/test-utils';
import { vi } from 'vitest';

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
  },
  writable: true,
});

// Mock FileReader
global.FileReader = class {
  onload: ((this: FileReader, ev: ProgressEvent<FileReader>) => any) | null = null;
  readAsDataURL(_blob: Blob) {
    // Use Promise.resolve().then() instead of setTimeout for immediate async execution
    Promise.resolve().then(() => {
      if (this.onload) {
        this.onload({
          target: { result: 'data:image/png;base64,test-base64-data' },
        } as any);
      }
    });
  }
} as any;

// Mock Vue components for testing
declare module '*.vue' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

// Configure Vue Test Utils
config.global.stubs = {
  'v-app': true,
  'v-main': true,
  'v-container': true,
  'v-card': true,
  'v-card-title': true,
  'v-card-text': true,
  'v-card-actions': true,
  'v-btn': true,
  'v-text-field': true,
  'v-select': true,
  'v-color-picker': true,
  'v-file-input': true,
  'v-img': true,
  'v-snackbar': true,
  'v-row': true,
  'v-col': true,
  'v-form': true,
  'v-spacer': true,
  'v-icon': true,
  'v-chip': true,
  'v-app-bar': true,
};
