import { mount, type VueWrapper } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { vi, type MockedFunction } from 'vitest';
import type { ComponentMountingOptions } from '@vue/test-utils';

// Create Vuetify instance for testing
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
  },
});

/**
 * Enhanced mount function with Vuetify and common configurations
 */
export function mountWithVuetify<T>(
  component: T,
  options: ComponentMountingOptions<T> = {}
): VueWrapper<InstanceType<T>> {
  return mount(component, {
    global: {
      plugins: [vuetify],
      stubs: {
        'router-link': true,
        'router-view': true,
        'transition': true,
        'transition-group': true,
        'teleport': true,
        ...options.stubs,
      },
      mocks: {
        $t: (key: string) => key,
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
        ...options.mocks,
      },
    },
    ...options,
  });
}

/**
 * Create a mock Pinia store
 */
export function createMockStore<T extends Record<string, unknown>>(
  storeData: T = {} as T
): T & {
  $patch: MockedFunction<unknown>;
  $reset: MockedFunction<unknown>;
  $dispose: MockedFunction<unknown>;
} {
  return {
    ...storeData,
    $patch: vi.fn(),
    $reset: vi.fn(),
    $dispose: vi.fn(),
  };
}

/**
 * Create a mock router
 */
export function createMockRouter() {
  return {
    push: vi.fn(),
    replace: vi.fn(),
    go: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    currentRoute: {
      value: {
        path: '/',
        name: 'home',
        params: {},
        query: {},
      },
    },
  };
}

/**
 * Create a mock route
 */
export function createMockRoute() {
  return {
    path: '/',
    name: 'home',
    params: {},
    query: {},
    hash: '',
    fullPath: '/',
    matched: [],
    meta: {},
  };
}

/**
 * Wait for a condition to be true
 */
export function waitFor(
  condition: () => boolean,
  timeout = 1000
): Promise<void> {
  return new Promise((resolve, reject) => {
    const startTime = Date.now();
    const check = () => {
      if (condition()) {
        resolve();
      } else if (Date.now() - startTime > timeout) {
        reject(new Error('Timeout waiting for condition'));
      } else {
        setTimeout(check, 10);
      }
    };
    check();
  });
}

/**
 * Flush all pending promises
 */
export function flushPromises(): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 0));
}

/**
 * Wait for next tick
 */
export async function nextTick(wrapper: VueWrapper<unknown>): Promise<void> {
  await wrapper.vm.$nextTick();
}

/**
 * Create a mock IntersectionObserver entry
 */
export function createIntersectionObserverEntry(
  target: Element,
  isIntersecting = true
): IntersectionObserverEntry {
  return {
    target,
    isIntersecting,
    intersectionRatio: isIntersecting ? 1 : 0,
    boundingClientRect: {} as DOMRectReadOnly,
    rootBounds: {} as DOMRectReadOnly,
    time: Date.now(),
  };
}

/**
 * Create a mock ResizeObserver entry
 */
export function createResizeObserverEntry(
  target: Element,
  contentRect: Partial<DOMRectReadOnly> = {}
): ResizeObserverEntry {
  return {
    target,
    contentRect: {
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      top: 0,
      right: 100,
      bottom: 100,
      left: 0,
      ...contentRect,
    } as DOMRectReadOnly,
    borderBoxSize: [],
    contentBoxSize: [],
    devicePixelContentBoxSize: [],
  };
}

/**
 * Mock IntersectionObserver
 */
export function mockIntersectionObserver(
  entries: IntersectionObserverEntry[] = []
) {
  const mockIntersectionObserver = vi.fn();
  mockIntersectionObserver.mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  });

  Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: mockIntersectionObserver,
  });

  return mockIntersectionObserver;
}

/**
 * Mock ResizeObserver
 */
export function mockResizeObserver() {
  const mockResizeObserver = vi.fn();
  mockResizeObserver.mockReturnValue({
    observe: vi.fn(),
    unobserve: vi.fn(),
    disconnect: vi.fn(),
  });

  Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: mockResizeObserver,
  });

  return mockResizeObserver;
}

/**
 * Mock fetch with specific responses
 */
export function mockFetch(responses: Record<string, unknown> = {}) {
  const mockFetch = vi.fn();
  
  mockFetch.mockImplementation((url: string) => {
    const response = responses[url] || responses['*'] || { ok: true, json: () => Promise.resolve({}) };
    
    if (typeof response === 'function') {
      return Promise.resolve(response(url));
    }
    
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve(response),
      text: () => Promise.resolve(JSON.stringify(response)),
      ...response,
    });
  });

  global.fetch = mockFetch;
  return mockFetch;
}

/**
 * Mock localStorage
 */
export function mockLocalStorage() {
  const store: Record<string, string> = {};
  
  const mockLocalStorage = {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    length: Object.keys(store).length,
  };

  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });

  return mockLocalStorage;
}

/**
 * Mock sessionStorage
 */
export function mockSessionStorage() {
  const store: Record<string, string> = {};
  
  const mockSessionStorage = {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] || null),
    length: Object.keys(store).length,
  };

  Object.defineProperty(window, 'sessionStorage', {
    value: mockSessionStorage,
    writable: true,
  });

  return mockSessionStorage;
}

/**
 * Create a mock file
 */
export function createMockFile(
  content: string | Blob = 'test content',
  name = 'test.txt',
  type = 'text/plain'
): File {
  const blob = content instanceof Blob ? content : new Blob([content], { type });
  return new File([blob], name, { type });
}

/**
 * Create a mock image file
 */
export function createMockImageFile(
  name = 'test.png',
  type = 'image/png',
  size = 1024
): File {
  const canvas = document.createElement('canvas');
  canvas.width = 100;
  canvas.height = 100;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, 100, 100);
  }
  
  return new File([canvas.toBlob(() => {})!], name, { type });
}

/**
 * Test utilities for common assertions
 */
export const testUtils = {
  /**
   * Assert that a component emits a specific event
   */
  assertEmitted(wrapper: VueWrapper<unknown>, event: string, payload?: unknown) {
    const emitted = wrapper.emitted(event);
    expect(emitted).toBeTruthy();
    if (payload !== undefined) {
      expect(emitted![0]).toEqual([payload]);
    }
  },

  /**
   * Assert that a component doesn't emit a specific event
   */
  assertNotEmitted(wrapper: VueWrapper<unknown>, event: string) {
    const emitted = wrapper.emitted(event);
    expect(emitted).toBeFalsy();
  },

  /**
   * Assert that a component has a specific class
   */
  assertHasClass(wrapper: VueWrapper<unknown>, className: string) {
    expect(wrapper.classes()).toContain(className);
  },

  /**
   * Assert that a component doesn't have a specific class
   */
  assertNotHasClass(wrapper: VueWrapper<unknown>, className: string) {
    expect(wrapper.classes()).not.toContain(className);
  },

  /**
   * Assert that a component has a specific attribute
   */
  assertHasAttribute(wrapper: VueWrapper<unknown>, attribute: string, value?: string) {
    if (value !== undefined) {
      expect(wrapper.attributes(attribute)).toBe(value);
    } else {
      expect(wrapper.attributes(attribute)).toBeDefined();
    }
  },

  /**
   * Assert that a component doesn't have a specific attribute
   */
  assertNotHasAttribute(wrapper: VueWrapper<unknown>, attribute: string) {
    expect(wrapper.attributes(attribute)).toBeUndefined();
  },

  /**
   * Assert that a component contains specific text
   */
  assertContainsText(wrapper: VueWrapper<unknown>, text: string) {
    expect(wrapper.text()).toContain(text);
  },

  /**
   * Assert that a component doesn't contain specific text
   */
  assertNotContainsText(wrapper: VueWrapper<unknown>, text: string) {
    expect(wrapper.text()).not.toContain(text);
  },

  /**
   * Assert that a component is visible
   */
  assertVisible(wrapper: VueWrapper<unknown>) {
    expect(wrapper.isVisible()).toBe(true);
  },

  /**
   * Assert that a component is not visible
   */
  assertNotVisible(wrapper: VueWrapper<unknown>) {
    expect(wrapper.isVisible()).toBe(false);
  },

  /**
   * Assert that a component exists
   */
  assertExists(wrapper: VueWrapper<unknown>) {
    expect(wrapper.exists()).toBe(true);
  },

  /**
   * Assert that a component doesn't exist
   */
  assertNotExists(wrapper: VueWrapper<unknown>) {
    expect(wrapper.exists()).toBe(false);
  },
};

/**
 * Common test data factories
 */
export const dataFactories = {
  /**
   * Create a mock student
   */
  createStudent(overrides: Partial<Record<string, unknown>> = {}) {
    return {
      id: 'student-1',
      firstName: 'John',
      lastName: 'Doe',
      grade: '10th',
      homeroom: 'A101',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides,
    };
  },

  /**
   * Create a mock class
   */
  createClass(overrides: Partial<Record<string, unknown>> = {}) {
    return {
      id: 'class-1',
      name: 'Mathematics 101',
      subject: 'Mathematics',
      teacher: 'Dr. Smith',
      room: 'B201',
      period: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides,
    };
  },

  /**
   * Create a mock transaction
   */
  createTransaction(overrides: Partial<Record<string, unknown>> = {}) {
    return {
      id: 'transaction-1',
      studentId: 'student-1',
      classId: 'class-1',
      type: 'attendance',
      status: 'present',
      date: new Date().toISOString(),
      notes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...overrides,
    };
  },
};
