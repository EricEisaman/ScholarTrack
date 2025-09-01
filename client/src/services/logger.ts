export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  NONE = 4
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  category: string
  message: string
  data?: unknown
  error?: Error
  userId?: string
  sessionId?: string
}

export interface LoggerConfig {
  level: LogLevel
  enableConsole: boolean
  enableRemote: boolean
  remoteEndpoint?: string
  maxEntries: number
  enableStructuredLogging: boolean
}

class Logger {
  private config: LoggerConfig;
  private entries: LogEntry[] = [];
  private sessionId: string;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = {
      level: this.getDefaultLogLevel(),
      enableConsole: true,
      enableRemote: false,
      maxEntries: 1000,
      enableStructuredLogging: true,
      ...config,
    };

    this.sessionId = this.generateSessionId();
  }

  private getDefaultLogLevel(): LogLevel {
    const env = (import.meta as { env?: { MODE?: string } }).env?.MODE ?? 'development';
    switch (env) {
    case 'production':
      return LogLevel.WARN;
    case 'development':
      return LogLevel.DEBUG;
    default:
      return LogLevel.INFO;
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = new Date(entry.timestamp).toISOString();
    const levelName = LogLevel[entry.level];

    if (this.config.enableStructuredLogging) {
      return `[${timestamp}] [${levelName}] [${entry.category}] ${entry.message}`;
    }

    return `[${levelName}] [${entry.category}] ${entry.message}`;
  }

  private addEntry(entry: LogEntry): void {
    if (!this.shouldLog(entry.level)) return;

    // Add to internal storage
    this.entries.push(entry);

    // Maintain max entries limit
    if (this.entries.length > this.config.maxEntries) {
      this.entries = this.entries.slice(-this.config.maxEntries);
    }

    // Console output
    if (this.config.enableConsole) {
      const formattedMessage = this.formatMessage(entry);

      switch (entry.level) {
      case LogLevel.DEBUG:
        // eslint-disable-next-line no-console
        console.debug(formattedMessage, entry.data ?? '');
        break;
      case LogLevel.INFO:
        // eslint-disable-next-line no-console
        console.info(formattedMessage, entry.data ?? '');
        break;
      case LogLevel.WARN:
        // eslint-disable-next-line no-console
        console.warn(formattedMessage, entry.data ?? '');
        break;
      case LogLevel.ERROR:
        // eslint-disable-next-line no-console
        console.error(formattedMessage, entry.error ?? entry.data ?? '');
        break;
      }
    }

    // Remote logging (if enabled)
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.sendToRemote(entry).catch(() => {
        // Silently fail remote logging to avoid breaking the app
      });
    }
  }

  private async sendToRemote(entry: LogEntry): Promise<void> {
    try {
      await fetch(this.config.remoteEndpoint!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (error) {
      // Don't log remote logging failures to avoid infinite loops
    }
  }

  // Public logging methods
  debug(category: string, message: string, data?: unknown): void {
    this.addEntry({
      timestamp: new Date().toISOString(),
      level: LogLevel.DEBUG,
      category,
      message,
      data,
      sessionId: this.sessionId,
    });
  }

  info(category: string, message: string, data?: unknown): void {
    this.addEntry({
      timestamp: new Date().toISOString(),
      level: LogLevel.INFO,
      category,
      message,
      data,
      sessionId: this.sessionId,
    });
  }

  warn(category: string, message: string, data?: unknown): void {
    this.addEntry({
      timestamp: new Date().toISOString(),
      level: LogLevel.WARN,
      category,
      message,
      data,
      sessionId: this.sessionId,
    });
  }

  error(category: string, message: string, error?: Error, data?: unknown): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      category,
      message,
      sessionId: this.sessionId,
    };

    if (error) {
      entry.error = error;
    }

    if (data) {
      entry.data = data;
    }

    this.addEntry(entry);
  }

  // Utility methods
  getEntries(level?: LogLevel): LogEntry[] {
    if (level !== undefined) {
      return this.entries.filter(entry => entry.level >= level);
    }
    return [...this.entries];
  }

  clear(): void {
    this.entries = [];
  }

  export(): string {
    return JSON.stringify(this.entries, null, 2);
  }

  updateConfig(newConfig: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...newConfig };
  }

  getSessionId(): string {
    return this.sessionId;
  }
}

// Create singleton instance
export const logger = new Logger();

// Convenience functions for common categories
export const apiLogger = {
  debug: (message: string, data?: unknown) => logger.debug('API', message, data),
  info: (message: string, data?: unknown) => logger.info('API', message, data),
  warn: (message: string, data?: unknown) => logger.warn('API', message, data),
  error: (message: string, error?: Error, data?: unknown) => logger.error('API', message, error, data),
};

export const storeLogger = {
  debug: (message: string, data?: unknown) => logger.debug('STORE', message, data),
  info: (message: string, data?: unknown) => logger.info('STORE', message, data),
  warn: (message: string, data?: unknown) => logger.warn('STORE', message, data),
  error: (message: string, error?: Error, data?: unknown) => logger.error('STORE', message, error, data),
};

export const componentLogger = {
  debug: (component: string, message: string, data?: unknown) => logger.debug(`COMPONENT:${component}`, message, data),
  info: (component: string, message: string, data?: unknown) => logger.info(`COMPONENT:${component}`, message, data),
  warn: (component: string, message: string, data?: unknown) => logger.warn(`COMPONENT:${component}`, message, data),
  error: (component: string, message: string, error?: Error, data?: unknown) => logger.error(`COMPONENT:${component}`, message, error, data),
};

export const userLogger = {
  debug: (message: string, data?: unknown) => logger.debug('USER', message, data),
  info: (message: string, data?: unknown) => logger.info('USER', message, data),
  warn: (message: string, data?: unknown) => logger.warn('USER', message, data),
  error: (message: string, error?: Error, data?: unknown) => logger.error('USER', message, error, data),
};

export default logger;
