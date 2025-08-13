import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateComprehensiveAvailabilityDto,
  CreateProviderSettingsDto,
  UpdateProviderSettingsDto,
  CreateBlockDayDto,
  UpdateBlockDayDto,
  ProviderSettingsResponseDto,
  BlockDayResponseDto,
  BookingWindowType,
  NoticeType,
  DayOfWeek,
} from './dto';
import { AvailabilityStatus } from '@prisma/client';

@Injectable()
export class AvailabilityEnhancedService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create comprehensive availability with day slots, time slots, and settings
   */
  async createComprehensiveAvailability(
    providerId: string,
    dto: CreateComprehensiveAvailabilityDto,
  ) {
    // First, create or update provider settings if provided
    if (dto.settings) {
      await this.upsertProviderSettings(providerId, dto.settings);
    }

    // Create block days if provided
    if (dto.blockDays && dto.blockDays.length > 0) {
      await this.createBulkBlockDays(providerId, dto.blockDays);
    }

    // Create availability slots for each day
    const createdSlots: any[] = [];
    
    for (const daySlot of dto.daySlots) {
      const slots = await this.createDaySlots(
        providerId,
        daySlot,
        dto.startDate,
        dto.endDate,
        dto.isRecurring
      );
      createdSlots.push(...slots);
    }

    return {
      success: true,
      message: 'Comprehensive availability created successfully',
      data: {
        slotsCreated: createdSlots.length,
        slots: createdSlots,
        settings: dto.settings ? await this.getProviderSettings(providerId) : null,
        blockDays: dto.blockDays ? await this.getProviderBlockDays(providerId) : null,
      },
    };
  }

  /**
   * Create availability slots for a specific day
   */
  private async createDaySlots(
    providerId: string,
    daySlot: any,
    startDate?: string,
    endDate?: string,
    isRecurring?: boolean
  ) {
    const slots: any[] = [];
    
    if (isRecurring && startDate && endDate) {
      // Create recurring slots for the specified period
      const dates = this.generateRecurringDates(
        daySlot.dayOfWeek,
        startDate,
        endDate
      );

      for (const date of dates) {
        for (const timeSlot of daySlot.timeSlots) {
          try {
            const slot = await this.createSingleSlot(
              providerId,
              date,
              timeSlot,
              daySlot.dayOfWeek
            );
            slots.push(slot);
          } catch (error) {
            console.warn(`Failed to create slot for ${date}: ${error.message}`);
          }
        }
      }
    } else {
      // Create slots for upcoming weeks (default behavior)
      const upcomingDates = this.generateUpcomingDatesForDay(
        daySlot.dayOfWeek,
        8 // Create for next 8 weeks
      );

      for (const date of upcomingDates) {
        for (const timeSlot of daySlot.timeSlots) {
          try {
            const slot = await this.createSingleSlot(
              providerId,
              date,
              timeSlot,
              daySlot.dayOfWeek
            );
            slots.push(slot);
          } catch (error) {
            console.warn(`Failed to create slot for ${date}: ${error.message}`);
          }
        }
      }
    }

    return slots;
  }

  /**
   * Create a single availability slot
   */
  private async createSingleSlot(
    providerId: string,
    date: string,
    timeSlot: any,
    dayOfWeek: string
  ) {
    // Check for conflicts with existing slots
    await this.validateNoOverlap(
      providerId,
      date,
      timeSlot.startTime,
      timeSlot.endTime
    );

    // Check for conflicts with block days
    await this.validateNotBlocked(
      providerId,
      date,
      timeSlot.startTime,
      timeSlot.endTime
    );

    return await this.prisma.providerAvailability.create({
      data: {
        providerId: parseInt(providerId),
        date: new Date(date),
        startTime: timeSlot.startTime,
        endTime: timeSlot.endTime,
        location: timeSlot.location,
        isVirtual: timeSlot.isVirtual || false,
        dayOfWeek: dayOfWeek,
        status: AvailabilityStatus.AVAILABLE,
        slotDuration: 30, // Default, can be customized
        maxAppointments: 1,
        currentAppointments: 0,
      },
    });
  }

  /**
   * Generate recurring dates for a specific day of week
   */
  private generateRecurringDates(
    dayOfWeek: string,
    startDate: string,
    endDate: string
  ): string[] {
    const dates: string[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    // Get day number (0 = Sunday, 1 = Monday, etc.)
    const dayMap = {
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
    };
    
    const targetDay = dayMap[dayOfWeek as keyof typeof dayMap];
    
    // Find first occurrence of the target day
    let currentDate = new Date(start);
    while (currentDate.getDay() !== targetDay) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Generate all occurrences until end date
    while (currentDate <= end) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 7); // Next week
    }
    
    return dates;
  }

  /**
   * Generate upcoming dates for a specific day of week
   */
  private generateUpcomingDatesForDay(dayOfWeek: string, weeks: number): string[] {
    const dates: string[] = [];
    const today = new Date();
    
    // Get day number
    const dayMap = {
      SUNDAY: 0,
      MONDAY: 1,
      TUESDAY: 2,
      WEDNESDAY: 3,
      THURSDAY: 4,
      FRIDAY: 5,
      SATURDAY: 6,
    };
    
    const targetDay = dayMap[dayOfWeek as keyof typeof dayMap];
    
    // Find next occurrence of the target day
    let currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() + 1); // Start from tomorrow
    
    while (currentDate.getDay() !== targetDay) {
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    // Generate dates for specified number of weeks
    for (let i = 0; i < weeks; i++) {
      dates.push(currentDate.toISOString().split('T')[0]);
      currentDate.setDate(currentDate.getDate() + 7);
    }
    
    return dates;
  }

  /**
   * Create or update provider settings
   */
  async upsertProviderSettings(
    providerId: string,
    dto: CreateProviderSettingsDto,
  ): Promise<ProviderSettingsResponseDto> {
    const existingSettings = await this.prisma.providerAvailabilitySettings.findUnique({
      where: { providerId: parseInt(providerId) },
    });

    let settings;
    if (existingSettings) {
      settings = await this.prisma.providerAvailabilitySettings.update({
        where: { providerId: parseInt(providerId) },
        data: {
          bookingWindowDays: dto.bookingWindowDays,
          bookingWindowType: dto.bookingWindowType,
          timezone: dto.timezone,
          newAppointmentDuration: dto.newAppointmentDuration,
          followUpAppointmentDuration: dto.followUpAppointmentDuration,
          minimumNoticeAmount: dto.minimumNoticeAmount,
          minimumNoticeType: dto.minimumNoticeType,
          eventBufferMinutes: dto.eventBufferMinutes,
        },
      });
    } else {
      settings = await this.prisma.providerAvailabilitySettings.create({
        data: {
          providerId: parseInt(providerId),
          bookingWindowDays: dto.bookingWindowDays || 30,
          bookingWindowType: dto.bookingWindowType || BookingWindowType.DAYS,
          timezone: dto.timezone || 'UTC',
          newAppointmentDuration: dto.newAppointmentDuration || 30,
          followUpAppointmentDuration: dto.followUpAppointmentDuration || 15,
          minimumNoticeAmount: dto.minimumNoticeAmount || 2,
          minimumNoticeType: dto.minimumNoticeType || NoticeType.HOURS,
          eventBufferMinutes: dto.eventBufferMinutes || 0,
        },
      });
    }

    return this.mapSettingsToResponseDto(settings);
  }

  /**
   * Get provider settings
   */
  async getProviderSettings(providerId: string): Promise<ProviderSettingsResponseDto | null> {
    const settings = await this.prisma.providerAvailabilitySettings.findUnique({
      where: { providerId: parseInt(providerId) },
    });

    return settings ? this.mapSettingsToResponseDto(settings) : null;
  }

  /**
   * Create multiple block days
   */
  async createBulkBlockDays(
    providerId: string,
    blockDays: CreateBlockDayDto[],
  ): Promise<BlockDayResponseDto[]> {
    const results: BlockDayResponseDto[] = [];

    for (const blockDay of blockDays) {
      try {
        const result = await this.createBlockDay(providerId, blockDay);
        results.push(result);
      } catch (error) {
        console.warn(`Failed to create block day for ${blockDay.date}: ${error.message}`);
      }
    }

    return results;
  }

  /**
   * Create a single block day
   */
  async createBlockDay(
    providerId: string,
    dto: CreateBlockDayDto,
  ): Promise<BlockDayResponseDto> {
    // Validate that the date is not in the past
    this.validateFutureDate(dto.date);

    // Create the block day
    const blockDay = await this.prisma.providerBlockDay.create({
      data: {
        providerId: parseInt(providerId),
        date: new Date(dto.date),
        startTime: dto.isFullDay ? null : dto.startTime,
        endTime: dto.isFullDay ? null : dto.endTime,
        isFullDay: dto.isFullDay || false,
        reason: dto.reason,
      },
    });

    return this.mapBlockDayToResponseDto(blockDay);
  }

  /**
   * Get provider block days
   */
  async getProviderBlockDays(
    providerId: string,
    startDate?: string,
    endDate?: string,
  ): Promise<BlockDayResponseDto[]> {
    const whereClause: any = { providerId: parseInt(providerId) };

    if (startDate || endDate) {
      whereClause.date = {};
      if (startDate) {
        whereClause.date.gte = new Date(startDate);
      }
      if (endDate) {
        whereClause.date.lte = new Date(endDate);
      }
    }

    const blockDays = await this.prisma.providerBlockDay.findMany({
      where: whereClause,
      orderBy: { date: 'asc' },
    });

    return blockDays.map(this.mapBlockDayToResponseDto);
  }

  /**
   * Validation methods
   */
  private async validateNoOverlap(
    providerId: string,
    date: string,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ): Promise<void> {
    const whereClause: any = {
      providerId: parseInt(providerId),
      date: new Date(date),
      OR: [
        {
          AND: [
            { startTime: { lt: endTime } },
            { endTime: { gt: startTime } },
          ],
        },
      ],
    };

    if (excludeId) {
      whereClause.NOT = { id: excludeId };
    }

    const overlapping = await this.prisma.providerAvailability.findFirst({
      where: whereClause,
    });

    if (overlapping) {
      throw new ConflictException(
        `Time slot overlaps with existing availability from ${overlapping.startTime} to ${overlapping.endTime}`,
      );
    }
  }

  private async validateNotBlocked(
    providerId: string,
    date: string,
    startTime: string,
    endTime: string,
  ): Promise<void> {
    const blockDay = await this.prisma.providerBlockDay.findFirst({
      where: {
        providerId: parseInt(providerId),
        date: new Date(date),
        OR: [
          { isFullDay: true },
          {
            AND: [
              { startTime: { not: null } },
              { endTime: { not: null } },
              { startTime: { lt: endTime } },
              { endTime: { gt: startTime } },
            ],
          },
        ],
      },
    });

    if (blockDay) {
      if (blockDay.isFullDay) {
        throw new ConflictException(`Date ${date} is completely blocked`);
      } else {
        throw new ConflictException(
          `Time slot conflicts with blocked period from ${blockDay.startTime} to ${blockDay.endTime}`,
        );
      }
    }
  }

  private validateFutureDate(dateString: string): void {
    const date = new Date(dateString);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (date < today) {
      throw new BadRequestException('Cannot create availability for past dates');
    }
  }

  /**
   * Mapping methods
   */
  private mapSettingsToResponseDto(settings: any): ProviderSettingsResponseDto {
    return {
      id: settings.id,
      providerId: settings.providerId,
      bookingWindowDays: settings.bookingWindowDays,
      bookingWindowType: settings.bookingWindowType,
      timezone: settings.timezone,
      newAppointmentDuration: settings.newAppointmentDuration,
      followUpAppointmentDuration: settings.followUpAppointmentDuration,
      minimumNoticeAmount: settings.minimumNoticeAmount,
      minimumNoticeType: settings.minimumNoticeType,
      eventBufferMinutes: settings.eventBufferMinutes,
      createdAt: settings.createdAt,
      updatedAt: settings.updatedAt,
    };
  }

  private mapBlockDayToResponseDto(blockDay: any): BlockDayResponseDto {
    return {
      id: blockDay.id,
      providerId: blockDay.providerId,
      date: blockDay.date.toISOString().split('T')[0],
      startTime: blockDay.startTime,
      endTime: blockDay.endTime,
      isFullDay: blockDay.isFullDay,
      reason: blockDay.reason,
      createdAt: blockDay.createdAt,
      updatedAt: blockDay.updatedAt,
    };
  }
} 