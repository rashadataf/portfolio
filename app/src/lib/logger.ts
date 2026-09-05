// Structured JSON logger for production

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  service: string;
  traceId?: string;
  spanId?: string;
  [key: string]: unknown;
}

class Logger {
  private serviceName: string;
  private minLevel: LogLevel;
  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  constructor(serviceName: string = "portfolio-app") {
    this.serviceName = serviceName;
    // In production, default to info level; in development, debug
    this.minLevel = (process.env.LOG_LEVEL as LogLevel) || 
      (process.env.NODE_ENV === "production" ? "info" : "debug");
  }

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.minLevel];
  }

  private formatEntry(level: LogLevel, message: string, meta: Record<string, unknown> = {}): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      service: this.serviceName,
      ...meta,
    };
  }

  private write(entry: LogEntry): void {
    const output = JSON.stringify(entry);
    
    // In development, pretty print to console
    if (process.env.NODE_ENV !== "production") {
      const colors = {
        debug: "\x1b[36m", // cyan
        info: "\x1b[32m",  // green
        warn: "\x1b[33m",  // yellow
        error: "\x1b[31m", // red
        reset: "\x1b[0m",
      };
      const color = colors[entry.level] || colors.reset;
      const levelLabel = entry.level.toUpperCase().padEnd(5);
      console.log(`${color}[${entry.timestamp}]${colors.reset} ${levelLabel} ${entry.message}`, 
        Object.keys(entry).length > 5 ? entry : "");
    } else {
      // In production, write raw JSON to stdout/stderr
      if (entry.level === "error") {
        console.error(output);
      } else {
        console.log(output);
      }
    }
  }

  debug(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog("debug")) {
      this.write(this.formatEntry("debug", message, meta));
    }
  }

  info(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog("info")) {
      this.write(this.formatEntry("info", message, meta));
    }
  }

  warn(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog("warn")) {
      this.write(this.formatEntry("warn", message, meta));
    }
  }

  error(message: string, meta?: Record<string, unknown>): void {
    if (this.shouldLog("error")) {
      this.write(this.formatEntry("error", message, meta));
    }
  }

  // Create a child logger with additional context
  child(context: Record<string, unknown>): Logger {
    const childLogger = new Logger(this.serviceName);
    
    // Wrap each log method to inject context
    const levels: LogLevel[] = ["debug", "info", "warn", "error"];
    for (const level of levels) {
      const originalMethod = childLogger[level].bind(childLogger);
      (childLogger as unknown as Record<string, (message: string, meta?: Record<string, unknown>) => void>)[level] = 
        (message: string, meta?: Record<string, unknown>) => {
          originalMethod(message, { ...context, ...meta });
        };
    }
    
    return childLogger;
  }
}

// Export singleton instance
export const logger = new Logger();

// Export class for creating child loggers
export { Logger };