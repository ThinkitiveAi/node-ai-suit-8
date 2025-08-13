import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { CustomLoggerService } from './common/services/logger.service';
import * as compression from 'compression';

async function bootstrap() {
  // Create app with custom logger
  const app = await NestFactory.create(AppModule, {
    logger: new CustomLoggerService(),
  });
  
  const configService = app.get(ConfigService);
  const logger = app.get(CustomLoggerService);

  // Trust proxy (important for reverse proxies)
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // Security middleware
  // app.use(helmet({
  //   contentSecurityPolicy: {
  //     directives: {
  //       defaultSrc: ["'self'"],
  //       styleSrc: ["'self'", "'unsafe-inline'"],
  //       scriptSrc: ["'self'"],
  //       imgSrc: ["'self'", "data:", "https:"],
  //       connectSrc: ["'self'"],
  //       fontSrc: ["'self'"],
  //       objectSrc: ["'none'"],
  //       mediaSrc: ["'self'"],
  //       frameSrc: ["'none'"],
  //     },
  //   },
  //   crossOriginEmbedderPolicy: false,
  // }));

  // Compression middleware
  app.use(compression());

  // CORS configuration
  app.enableCors({
    // origin: configService.get('cors.origin'),
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    // allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  });

  // Global prefix
  app.setGlobalPrefix('');

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Health First API')
    // .setDescription(`
    //   🏥 **Health First Backend API** - Production-Ready Healthcare Management System
      
    //   ## 🚀 Features:
    //   - **Authentication & Authorization**: JWT-based auth with refresh tokens
    //   - **Patient Management**: Registration, profile management, search providers
    //   - **Provider Management**: Profile management, availability scheduling
    //   - **Availability System**: Recurring appointments, bulk operations, advanced search
    //   - **Security**: bcrypt hashing, rate limiting, input validation
    //   - **Monitoring**: Health checks, metrics, structured logging
      
    //   ## 🔐 Security:
    //   - Passwords hashed with bcrypt (12 salt rounds)
    //   - JWT access tokens (15min) & refresh tokens (7 days)
    //   - Rate limiting: 5 login attempts/min, 100 requests/min
    //   - Input validation & sanitization
    //   - Security headers (helmet)
    //   - SQL injection prevention (Prisma ORM)
      
    //   ## 🔑 Authentication:
    //   1. **Login**: POST to \`/api/v1/patient/login\` or \`/api/v1/provider/login\`
    //   2. **Use Token**: Include access token as \`Authorization: Bearer {token}\`
    //   3. **Refresh**: Use \`/api/v1/auth/refresh\` with refresh token
      
    //   ## 📊 Monitoring:
    //   - **Health Check**: \`GET /health\` - Application health status
    //   - **Metrics**: \`GET /health/metrics\` - Performance metrics
    //   - **Logs**: Structured JSON logs with Winston
      
    //   ## 🏥 Demo Accounts:
    //   **Password for all demo accounts:** \`Demo123!@#\`
      
    //   **Patients:**
    //   - john.doe@example.com
    //   - jane.smith@example.com
    //   - michael.johnson@example.com
      
    //   **Providers:**
    //   - dr.emily.carter@healthfirst.com (Cardiology)
    //   - dr.robert.thompson@healthfirst.com (Neurology)
    //   - dr.maria.rodriguez@healthfirst.com (Pediatrics)
    // `)
    .setVersion('1.0.0')
    // .addServer('http://localhost:3000', 'Development')
    // .addServer('https://api.healthfirst.com', 'Production')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT access token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addTag('Authentication', 'User authentication and token management')
    .addTag('Patient', 'Patient profile and account management')
    .addTag('Provider', 'Healthcare provider profile management')
    .addTag('Provider Availability', 'Provider scheduling and availability management')
    .addTag('System Health', 'Application health monitoring and metrics')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Health First API Documentation',
    customfavIcon: '/favicon.ico',
    customCss: `
      .topbar-wrapper .link { display: none; }
      .swagger-ui .topbar { background-color: #2c5aa0; }
    `,
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      // filter: true,
      showExtensions: true,
      showCommonExtensions: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // Start the application
  const port = configService.get('port') || 3000;
  await app.listen(port, '0.0.0.0');

  // Application startup logging
  logger.log(`🚀 Health First API started successfully`, 'Bootstrap');
  logger.log(`🌐 Server running on: http://localhost:${port}`, 'Bootstrap');
  logger.log(`📚 API Documentation: http://localhost:${port}/api/docs`, 'Bootstrap');
  logger.log(`🏥 Health Check: http://localhost:${port}/health`, 'Bootstrap');
  logger.log(`📊 Metrics: http://localhost:${port}/health/metrics`, 'Bootstrap');
  logger.log(`🔧 Environment: ${process.env.NODE_ENV || 'development'}`, 'Bootstrap');
  
  // Graceful shutdown handling
  process.on('SIGTERM', async () => {
    logger.log('📤 SIGTERM received, shutting down gracefully', 'Bootstrap');
    await app.close();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.log('📤 SIGINT received, shutting down gracefully', 'Bootstrap');
    await app.close();
    process.exit(0);
  });
}

bootstrap().catch((error) => {
  console.error('❌ Application failed to start:', error);
  process.exit(1);
});
