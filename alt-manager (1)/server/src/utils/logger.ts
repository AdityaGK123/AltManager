import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Centralized logging system with file persistence
 */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOG_DIR = path.join(__dirname, '../../logs');
const LOG_FILE = path.join(LOG_DIR, 'runtime.log');
const ERROR_LOG_FILE = path.join(LOG_DIR, 'errors.log');

// Ensure logs directory exists
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

export enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG',
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: any;
}

/**
 * Format log entry
 */
function formatLogEntry(entry: LogEntry): string {
  const contextStr = entry.context ? ` | ${JSON.stringify(entry.context)}` : '';
  return `[${entry.timestamp}] [${entry.level}] ${entry.message}${contextStr}\n`;
}

/**
 * Write to log file
 */
function writeToFile(filePath: string, content: string): void {
  try {
    fs.appendFileSync(filePath, content);
  } catch (error) {
    console.error('Failed to write to log file:', error);
  }
}

/**
 * Main logging function
 */
export function log(message: string, level: LogLevel = LogLevel.INFO, context?: any): void {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
  };
  
  const formatted = formatLogEntry(entry);
  
  // Console output with colors
  switch (level) {
    case LogLevel.ERROR:
      console.error(`❌ ${formatted.trim()}`);
      writeToFile(ERROR_LOG_FILE, formatted);
      break;
    case LogLevel.WARN:
      console.warn(`⚠️  ${formatted.trim()}`);
      break;
    case LogLevel.DEBUG:
      if (process.env.NODE_ENV === 'development') {
        console.log(`🔍 ${formatted.trim()}`);
      }
      break;
    default:
      console.log(`ℹ️  ${formatted.trim()}`);
  }
  
  // Write to main log file
  writeToFile(LOG_FILE, formatted);
}

/**
 * Convenience methods
 */
export const logger = {
  info: (message: string, context?: any) => log(message, LogLevel.INFO, context),
  warn: (message: string, context?: any) => log(message, LogLevel.WARN, context),
  error: (message: string, context?: any) => log(message, LogLevel.ERROR, context),
  debug: (message: string, context?: any) => log(message, LogLevel.DEBUG, context),
};

/**
 * Request logger middleware
 */
export function requestLogger(req: any, res: any, next: any): void {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    const message = `${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`;
    
    if (res.statusCode >= 500) {
      log(message, LogLevel.ERROR, { ip: req.ip, userAgent: req.get('user-agent') });
    } else if (res.statusCode >= 400) {
      log(message, LogLevel.WARN, { ip: req.ip });
    } else if (duration > 1000) {
      log(message, LogLevel.WARN, { slow: true });
    } else {
      log(message, LogLevel.INFO);
    }
  });
  
  next();
}

/**
 * Clean old logs (keep last 7 days)
 */
export function cleanOldLogs(): void {
  const files = [LOG_FILE, ERROR_LOG_FILE];
  const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
  
  files.forEach((file) => {
    if (fs.existsSync(file)) {
      const stats = fs.statSync(file);
      const age = Date.now() - stats.mtimeMs;
      
      if (age > maxAge) {
        const archiveName = `${file}.${new Date().toISOString().split('T')[0]}`;
        fs.renameSync(file, archiveName);
        log(`Archived old log: ${path.basename(archiveName)}`, LogLevel.INFO);
      }
    }
  });
}

// Clean logs on startup
cleanOldLogs();
