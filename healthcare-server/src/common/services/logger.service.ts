import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class CustomLoggerService implements LoggerService {
  private logger: winston.Logger;

  constructor() {
    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: winston.format.combine(
        winston.format.timestamp({
          format: 'YYYY-MM-DD HH:mm:ss',
        }),
        winston.format.errors({ stack: true }),
        winston.format.json(),
        winston.format.printf(({ level, message, timestamp, stack, context, ...meta }: any) => {
          const logObject: any = {
            timestamp,
            level,
            message,
            context,
            ...meta,
          };
          
          if (stack) {
            logObject.stack = stack;
          }
          
          return JSON.stringify(logObject);
        })
      ),
      defaultMeta: {
        service: 'health-first-api',
        version: process.env.npm_package_version || '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
      transports: [
        // Console transport for development
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
            winston.format.printf(({ level, message, timestamp, context }) => {
              return `${timestamp} [${context || 'Application'}] ${level}: ${message}`;
            })
          ),
        }),
        
        // File transport for all logs
        new winston.transports.DailyRotateFile({
          filename: 'logs/application-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '14d',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),
        
        // Error file transport
        new winston.transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxSize: '20m',
          maxFiles: '30d',
          level: 'error',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json()
          ),
        }),
      ],
    });

    // Handle uncaught exceptions and unhandled rejections
    this.logger.exceptions.handle(
      new winston.transports.DailyRotateFile({
        filename: 'logs/exceptions-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
      })
    );

    this.logger.rejections.handle(
      new winston.transports.DailyRotateFile({
        filename: 'logs/rejections-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '30d',
      })
    );
  }

  log(message: string, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: string, stack?: string, context?: string) {
    this.logger.error(message, { stack, context });
  }

  warn(message: string, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string) {
    this.logger.verbose(message, { context });
  }

  // Additional methods for structured logging
  logApiRequest(req: any, res: any, responseTime: number) {
    const logData = {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      responseTime: `${responseTime}ms`,
      userAgent: req.get('User-Agent'),
      ip: req.ip,
      userId: req.user?.userId || 'anonymous',
      contentLength: res.get('Content-Length'),
    };

    if (res.statusCode >= 400) {
      this.logger.warn('API Request Failed', logData);
    } else {
      this.logger.info('API Request', logData);
    }
  }

  logDatabaseQuery(query: string, duration: number, error?: Error) {
    const logData = {
      query: query.length > 200 ? query.substring(0, 200) + '...' : query,
      duration: `${duration}ms`,
      context: 'Database',
    };

    if (error) {
      this.logger.error('Database Query Failed', error.stack, 'Database');
    } else if (duration > 1000) {
      this.logger.warn('Slow Database Query', logData);
    } else {
      this.logger.debug('Database Query', logData);
    }
  }

  logAuthEvent(event: string, userId?: string, details?: any) {
    this.logger.info('Authentication Event', {
      event,
      userId: userId || 'unknown',
      context: 'Authentication',
      ...details,
    });
  }

  logSecurityEvent(event: string, details: any) {
    this.logger.warn('Security Event', {
      event,
      context: 'Security',
      ...details,
    });
  }

  // Business logic logging
  logBusinessEvent(event: string, details: any) {
    this.logger.info('Business Event', {
      event,
      context: 'Business',
      ...details,
    });
  }
} 