import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE, APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { PatientModule } from './patient/patient.module';
import { ProviderModule } from './provider/provider.module';
import { AvailabilityModule } from './availability/availability.module';
import { AppointmentModule } from './appointment/appointment.module';
import { HealthModule } from './health/health.module';
import { PrismaService } from './prisma/prisma.service';
import { CustomLoggerService } from './common/services/logger.service';
import { RequestLoggingMiddleware } from './common/middleware/request-logging.middleware';
import { SecurityMiddleware } from './common/middleware/security.middleware';
import configuration from './config/configuration';
import { ValidationPipe } from './common/pipes/validation.pipe';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    ThrottlerModule.forRootAsync({
      useFactory: () => ({
        throttlers: [
          {
            ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10) * 1000, // Convert to milliseconds
            limit: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
          },
        ],
      }),
    }),
    AuthModule,
    PatientModule,
    ProviderModule,
    AvailabilityModule,
    AppointmentModule,
    HealthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    CustomLoggerService,
    {
      provide: APP_PIPE,
      useClass: ValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: TransformInterceptor,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(SecurityMiddleware, RequestLoggingMiddleware)
      .forRoutes('*');
  }
}
