import { Module } from '@nestjs/common';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { AvailabilityEnhancedController } from './availability-enhanced.controller';
import { AvailabilityEnhancedService } from './availability-enhanced.service';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  controllers: [
    AvailabilityController,
    AvailabilityEnhancedController,
  ],
  providers: [
    AvailabilityService,
    AvailabilityEnhancedService,
    PrismaService,
  ],
  exports: [
    AvailabilityService,
    AvailabilityEnhancedService,
  ],
})
export class AvailabilityModule {} 