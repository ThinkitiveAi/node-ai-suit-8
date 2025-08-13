import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { CustomLoggerService } from '../services/logger.service';

@Injectable()
export class RequestLoggingMiddleware implements NestMiddleware {
  constructor(private readonly logger: CustomLoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const start = Date.now();
    const { method, originalUrl, ip, headers } = req;
    
    // Log request start
    this.logger.debug(`Incoming ${method} ${originalUrl}`, 'RequestLogging');

    // Override res.end to capture response details
    const originalEnd = res.end.bind(res);
    res.end = function (this: Response, chunk?: any, encoding?: any, cb?: any) {
      const responseTime = Date.now() - start;
      
      // Log the request completion
      const loggerInstance = req.app.get('logger') || new CustomLoggerService();
      loggerInstance.logApiRequest(req, res, responseTime);
      
      return originalEnd(chunk, encoding, cb);
    } as any;

    next();
  }
} 