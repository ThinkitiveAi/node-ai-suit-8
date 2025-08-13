import { Controller, Get } from '@nestjs/common';
import {
  HealthCheckService,
  HealthCheck,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { CustomLoggerService } from '../common/services/logger.service';

@ApiTags('System Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prisma: PrismaHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private prismaService: PrismaService,
    private logger: CustomLoggerService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Health check',
    description: 'Returns the health status of the application and its dependencies',
  })
  @ApiResponse({
    status: 200,
    description: 'Health check successful',
    schema: {
      type: 'object',
      properties: {
        status: {
          type: 'string',
          example: 'ok',
        },
        info: {
          type: 'object',
          properties: {
            database: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
              },
            },
            memory_heap: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
              },
            },
            memory_rss: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
              },
            },
            storage: {
              type: 'object',
              properties: {
                status: { type: 'string', example: 'up' },
              },
            },
          },
        },
        error: {
          type: 'object',
        },
        details: {
          type: 'object',
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Health check failed',
  })
  check() {
    return this.health.check([
      () => this.prisma.pingCheck('database', this.prismaService),
      () => this.memory.checkHeap('memory_heap', 150 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 150 * 1024 * 1024),
      () => this.disk.checkStorage('storage', { path: '/', thresholdPercent: 0.9 }),
    ]);
  }

  @Get('ready')
  @ApiOperation({
    summary: 'Readiness check',
    description: 'Returns whether the application is ready to serve traffic',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is ready',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'ready' },
        timestamp: { type: 'string', example: '2024-01-15T10:00:00.000Z' },
        uptime: { type: 'number', example: 12345 },
        version: { type: 'string', example: '1.0.0' },
      },
    },
  })
  readiness() {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
    };
  }

  @Get('live')
  @ApiOperation({
    summary: 'Liveness check',
    description: 'Returns whether the application is alive and responding',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is alive',
    schema: {
      type: 'object',
      properties: {
        status: { type: 'string', example: 'alive' },
        timestamp: { type: 'string', example: '2024-01-15T10:00:00.000Z' },
        pid: { type: 'number', example: 12345 },
        memory: {
          type: 'object',
          properties: {
            heapUsed: { type: 'number' },
            heapTotal: { type: 'number' },
            external: { type: 'number' },
            rss: { type: 'number' },
          },
        },
      },
    },
  })
  liveness() {
    const memoryUsage = process.memoryUsage();
    return {
      status: 'alive',
      timestamp: new Date().toISOString(),
      pid: process.pid,
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100, // MB
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100, // MB
        external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100, // MB
        rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100, // MB
      },
    };
  }

  @Get('metrics')
  @ApiOperation({
    summary: 'Application metrics',
    description: 'Returns basic application metrics for monitoring',
  })
  @ApiResponse({
    status: 200,
    description: 'Application metrics',
  })
  async metrics() {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    // Get database connection count (simplified)
    let dbConnections = 0;
    try {
      // This is a simplified check - in production you might want more detailed metrics
      await this.prismaService.$executeRaw`SELECT 1`;
      dbConnections = 1; // Active connection
    } catch (error) {
      this.logger.error('Failed to get database metrics', error.stack, 'HealthController');
    }

    return {
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      nodejs: process.version,
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100,
        external: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100,
        rss: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100,
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
      },
      database: {
        connections: dbConnections,
      },
    };
  }
} 