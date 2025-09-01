import { vi } from 'vitest';

/**
 * Test configuration constants
 */
export const TEST_CONFIG = {
  TIMEOUTS: {
    DEFAULT: 10000,
    SHORT: 5000,
    LONG: 30000,
  },
  DELAYS: {
    MINIMAL: 0,
    SHORT: 100,
    MEDIUM: 500,
    LONG: 1000,
  },
  RETRY_ATTEMPTS: 3,
  POLLING_INTERVAL: 10,
} as const;

/**
 * Common test data constants
 */
export const TEST_DATA = {
  STUDENT: {
    DEFAULT: {
      id: 'test-student-1',
      firstName: 'John',
      lastName: 'Doe',
      grade: '10th',
      homeroom: 'A101',
      email: 'john.doe@school.edu',
      phone: '+1-555-0123',
      address: '123 Main St, Anytown, USA',
      emergencyContact: 'Jane Doe',
      emergencyPhone: '+1-555-0124',
      notes: 'Test student notes',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    VALID_NAMES: [
      'Alice Johnson',
      'Bob Smith',
      'Carol Davis',
      'David Wilson',
      'Eva Brown',
    ],
    INVALID_NAMES: [
      '', // Empty
      'A', // Too short
      'A'.repeat(51), // Too long
      '123', // Numbers only
      '!@#$%', // Special characters only
    ],
  },
  CLASS: {
    DEFAULT: {
      id: 'test-class-1',
      name: 'Advanced Mathematics',
      subject: 'Mathematics',
      teacher: 'Dr. Smith',
      room: 'B201',
      period: 1,
      capacity: 30,
      description: 'Advanced mathematics course for high school students',
      schedule: 'Mon, Wed, Fri 8:00 AM - 9:30 AM',
      credits: 1.0,
      gradeLevel: '10th-12th',
      prerequisites: ['Algebra I', 'Geometry'],
      materials: ['Calculator', 'Textbook', 'Notebook'],
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    VALID_NAMES: [
      'English Literature',
      'World History',
      'Physics 101',
      'Chemistry Lab',
      'Computer Science',
    ],
    INVALID_NAMES: [
      '', // Empty
      'A', // Too short
      'A'.repeat(101), // Too long
    ],
  },
  TRANSACTION: {
    DEFAULT: {
      id: 'test-transaction-1',
      studentId: 'test-student-1',
      classId: 'test-class-1',
      type: 'attendance',
      status: 'present',
      date: '2024-01-01T00:00:00.000Z',
      time: '08:00:00',
      duration: 90,
      notes: 'Test transaction notes',
      metadata: {
        location: 'Room B201',
        device: 'Computer Station 1',
        verified: true,
      },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    TYPES: [
      'attendance',
      'grade',
      'behavior',
      'participation',
      'homework',
      'quiz',
      'test',
      'project',
      'other',
    ],
    STATUSES: [
      'present',
      'absent',
      'late',
      'excused',
      'tardy',
      'suspended',
      'other',
    ],
  },
  STYLE_SETTINGS: {
    DEFAULT: {
      id: 'default',
      primaryColor: '#1976D2',
      secondaryColor: '#424242',
      tertiaryColor: '#000000',
      quaternaryColor: '#121212',
      schoolName: 'ScholarTrack Academy',
      logoImage: 'data:image/png;base64,test-logo-data',
      fontFamily: 'Roboto, sans-serif',
      borderRadius: '4px',
      shadowDepth: '2px',
      animationSpeed: '0.3s',
      theme: 'light',
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    },
    VALID_COLORS: [
      '#FF0000', // Red
      '#00FF00', // Green
      '#0000FF', // Blue
      '#FFFF00', // Yellow
      '#FF00FF', // Magenta
      '#00FFFF', // Cyan
      '#000000', // Black
      '#FFFFFF', // White
    ],
    INVALID_COLORS: [
      '', // Empty
      'red', // Named color
      'rgb(255,0,0)', // RGB format
      'hsl(0,100%,50%)', // HSL format
      '#GGGGGG', // Invalid hex
      '#123', // Short hex
      '#1234567', // Long hex
    ],
  },
} as const;

/**
 * Mock data generators
 */
export const mockGenerators = {
  /**
   * Generate a random string of specified length
   */
  randomString(length: number, charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  },

  /**
   * Generate a random email address
   */
  randomEmail(): string {
    const username = this.randomString(8);
    const domain = this.randomString(6);
    const tld = ['com', 'org', 'net', 'edu', 'gov'][Math.floor(Math.random() * 5)];
    return `${username}@${domain}.${tld}`;
  },

  /**
   * Generate a random phone number
   */
  randomPhone(): string {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const prefix = Math.floor(Math.random() * 900) + 100;
    const lineNumber = Math.floor(Math.random() * 9000) + 1000;
    return `+1-${areaCode}-${prefix}-${lineNumber}`;
  },

  /**
   * Generate a random date within a range
   */
  randomDate(start: Date = new Date('2020-01-01'), end: Date = new Date()): string {
    const randomTime = start.getTime() + Math.random() * (end.getTime() - start.getTime());
    return new Date(randomTime).toISOString();
  },

  /**
   * Generate a random color in hex format
   */
  randomColor(): string {
    return `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`;
  },

  /**
   * Generate a random integer within a range
   */
  randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },

  /**
   * Generate a random float within a range
   */
  randomFloat(min: number, max: number, decimals = 2): number {
    const random = Math.random() * (max - min) + min;
    return Number(random.toFixed(decimals));
  },

  /**
   * Generate a random boolean
   */
  randomBoolean(): boolean {
    return Math.random() > 0.5;
  },

  /**
   * Pick a random item from an array
   */
  randomChoice<T>(array: T[]): T {
    return array[Math.floor(Math.random() * array.length)];
  },

  /**
   * Generate multiple random items from an array
   */
  randomChoices<T>(array: T[], count: number): T[] {
    const shuffled = [...array].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, Math.min(count, array.length));
  },

  /**
   * Generate a random UUID
   */
  randomUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  },
};

/**
 * Test assertion helpers
 */
export const assertionHelpers = {
  /**
   * Assert that a value is a valid date string
   */
  isValidDateString(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    const date = new Date(value);
    return !isNaN(date.getTime());
  },

  /**
   * Assert that a value is a valid color hex
   */
  isValidColorHex(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    return /^#[0-9A-F]{6}$/i.test(value);
  },

  /**
   * Assert that a value is a valid email
   */
  isValidEmail(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(value);
  },

  /**
   * Assert that a value is a valid phone number
   */
  isValidPhone(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    const phoneRegex = /^\+?1?[-.\s]?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})$/;
    return phoneRegex.test(value);
  },

  /**
   * Assert that a value is within a numeric range
   */
  isInRange(value: number, min: number, max: number): boolean {
    return value >= min && value <= max;
  },

  /**
   * Assert that a value has a specific length
   */
  hasLength(value: unknown, length: number): boolean {
    if (Array.isArray(value) || typeof value === 'string') {
      return value.length === length;
    }
    return false;
  },

  /**
   * Assert that a value is one of the allowed values
   */
  isOneOf(value: unknown, allowedValues: unknown[]): boolean {
    return allowedValues.includes(value);
  },
};

/**
 * Test environment setup helpers
 */
export const environmentHelpers = {
  /**
   * Setup common mocks for all tests
   */
  setupCommonMocks() {
    // Mock performance API
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

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  },

  /**
   * Clean up mocks after tests
   */
  cleanupMocks() {
    vi.restoreAllMocks();
  },

  /**
   * Reset all mocks between tests
   */
  resetMocks() {
    vi.clearAllMocks();
  },
};

/**
 * Test data factories
 */
export const dataFactories = {
  /**
   * Create a student with default values and optional overrides
   */
  createStudent(overrides: Partial<Record<string, unknown>> = {}) {
    return {
      ...TEST_DATA.STUDENT.DEFAULT,
      ...overrides,
    };
  },

  /**
   * Create a class with default values and optional overrides
   */
  createClass(overrides: Partial<Record<string, unknown>> = {}) {
    return {
      ...TEST_DATA.CLASS.DEFAULT,
      ...overrides,
    };
  },

  /**
   * Create a transaction with default values and optional overrides
   */
  createTransaction(overrides: Partial<Record<string, unknown>> = {}) {
    return {
      ...TEST_DATA.TRANSACTION.DEFAULT,
      ...overrides,
    };
  },

  /**
   * Create style settings with default values and optional overrides
   */
  createStyleSettings(overrides: Partial<Record<string, unknown>> = {}) {
    return {
      ...TEST_DATA.STYLE_SETTINGS.DEFAULT,
      ...overrides,
    };
  },

  /**
   * Create multiple students
   */
  createStudents(count: number, overrides: Partial<Record<string, unknown>> = {}) {
    return Array.from({ length: count }, (_, index) =>
      this.createStudent({
        id: `test-student-${index + 1}`,
        firstName: `Student${index + 1}`,
        lastName: `LastName${index + 1}`,
        ...overrides,
      })
    );
  },

  /**
   * Create multiple classes
   */
  createClasses(count: number, overrides: Partial<Record<string, unknown>> = {}) {
    return Array.from({ length: count }, (_, index) =>
      this.createClass({
        id: `test-class-${index + 1}`,
        name: `Class ${index + 1}`,
        ...overrides,
      })
    );
  },

  /**
   * Create multiple transactions
   */
  createTransactions(count: number, overrides: Partial<Record<string, unknown>> = {}) {
    return Array.from({ length: count }, (_, index) =>
      this.createTransaction({
        id: `test-transaction-${index + 1}`,
        ...overrides,
      })
    );
  },
};
