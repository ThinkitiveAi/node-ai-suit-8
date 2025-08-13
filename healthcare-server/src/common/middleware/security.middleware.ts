import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
import { CustomLoggerService } from '../services/logger.service';

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  constructor(private readonly logger: CustomLoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Apply helmet security headers
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          styleSrc: ["'self'", "'unsafe-inline'"],
          scriptSrc: ["'self'"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'"],
          fontSrc: ["'self'"],
          objectSrc: ["'none'"],
          mediaSrc: ["'self'"],
          frameSrc: ["'none'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
    })(req, res, () => {});

    // Additional security headers
    res.setHeader('X-API-Version', 'v1');
    res.setHeader('X-RateLimit-Limit', '100');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    
    // Remove sensitive headers
    res.removeHeader('X-Powered-By');
    res.removeHeader('Server');

    // Log suspicious activity
    this.detectSuspiciousActivity(req);

    next();
  }

  private detectSuspiciousActivity(req: Request) {
    const suspiciousPatterns = [
      /(\.\.\/)|(\.\.\\)/g, // Path traversal
      /(union|select|insert|update|delete|drop|create|alter)/gi, // SQL injection
      /<script[^>]*>.*?<\/script>/gi, // XSS
      /javascript:/gi, // JavaScript protocol
      /vbscript:/gi, // VBScript protocol
    ];

    const userAgent = req.get('User-Agent') || '';
    const url = req.originalUrl;
    const body = JSON.stringify(req.body || {});

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(url) || pattern.test(body) || pattern.test(userAgent)) {
        this.logger.logSecurityEvent('Suspicious Activity Detected', {
          ip: req.ip,
          userAgent,
          url,
          pattern: pattern.toString(),
          userId: (req as any).user?.userId || 'anonymous',
        });
        break;
      }
    }
  }
} 