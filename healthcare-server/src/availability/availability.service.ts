import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateAvailabilityDto,
  CreateBulkAvailabilityDto,
  UpdateAvailabilityDto,
  SearchAvailabilityDto,
  AvailabilityResponseDto,
  PaginatedAvailabilityResponseDto,
  BulkOperationResponseDto,
} from './dto';
import {
  AvailabilityStatus,
  RecurrencePattern,
  ProviderAvailability,
} from '@prisma/client';

interface TimeSlot {
  date: Date;
  startTime: string;
  endTime: string;
}

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  async createAvailability(
    providerId: string,
    dto: CreateAvailabilityDto,
  ): Promise<AvailabilityResponseDto> {
    // Validate provider exists
    const provider = await this.prisma.provider.findUnique({
      where: { id: parseInt(providerId, 10) },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    // Validate time range
    this.validateTimeRange(dto.startTime, dto.endTime);

    // Validate date is not in the past
    this.validateFutureDate(dto.date);

    // Check for overlapping slots
    await this.validateNoOverlap(parseInt(providerId, 10), dto.date, dto.startTime, dto.endTime);

    // Create the availability slot
    const availability = await this.prisma.providerAvailability.create({
      data: {
        providerId: parseInt(providerId, 10),
        date: new Date(dto.date),
        startTime: dto.startTime,
        endTime: dto.endTime,
        isRecurring: dto.isRecurring || false,
        recurrencePattern: dto.recurrencePattern,
        recurrenceEndDate: dto.recurrenceEndDate ? new Date(dto.recurrenceEndDate) : null,
        slotDuration: dto.slotDuration || 30,
        maxAppointments: dto.maxAppointments || 1,
        notes: dto.notes,
        timezone: dto.timezone || 'UTC',
      },
    });

    // Handle recurring slots
    if (dto.isRecurring && dto.recurrencePattern && dto.recurrenceEndDate) {
      await this.createRecurringSlots(providerId, dto);
    }

    return this.mapToResponseDto(availability);
  }

  async createBulkAvailability(
    providerId: string,
    dto: CreateBulkAvailabilityDto,
  ): Promise<BulkOperationResponseDto> {
    const results: AvailabilityResponseDto[] = [];
    const errors: string[] = [];
    let successful = 0;
    let failed = 0;

    for (const slot of dto.slots) {
      try {
        const result = await this.createAvailability(providerId, slot);
        results.push(result);
        successful++;
      } catch (error) {
        errors.push(`Slot ${slot.date} ${slot.startTime}-${slot.endTime}: ${error.message}`);
        failed++;
      }
    }

    return {
      successful,
      failed,
      results,
      errors,
    };
  }

  async getProviderAvailability(
    providerId: string,
    query: SearchAvailabilityDto,
  ): Promise<PaginatedAvailabilityResponseDto> {
    const whereClause: any = {
      providerId: parseInt(providerId, 10),
    };

    // Apply date filters
    if (query.date) {
      whereClause.date = new Date(query.date);
    } else if (query.startDate || query.endDate) {
      whereClause.date = {};
      if (query.startDate) {
        whereClause.date.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        whereClause.date.lte = new Date(query.endDate);
      }
    }

    // Apply time filters
    if (query.startTime) {
      whereClause.startTime = { gte: query.startTime };
    }
    if (query.endTime) {
      whereClause.endTime = { lte: query.endTime };
    }

    // Apply status filter
    if (query.status) {
      whereClause.status = query.status;
    }

    // Apply minimum duration filter
    if (query.minDuration) {
      whereClause.slotDuration = { gte: query.minDuration };
    }

    const skip = ((query.page || 1) - 1) * (query.limit || 20);
    const take = query.limit || 20;    

    const [availability, total] = await Promise.all([
      this.prisma.providerAvailability.findMany({
        where: whereClause,
        skip,
        take,
        orderBy: [
          { date: 'asc' },
          { startTime: 'asc' },
        ],
      }),
      this.prisma.providerAvailability.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(total / take);
    const currentPage = query.page || 1;

    return {
      data: availability.map(this.mapToResponseDto),
      total,
      page: currentPage,
      limit: take,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  }

  async searchAvailability(
    query: SearchAvailabilityDto,
  ): Promise<PaginatedAvailabilityResponseDto> {
    const whereClause: any = {
      status: query.status || AvailabilityStatus.AVAILABLE,
    };

    // Apply date filters
    if (query.date) {
      whereClause.date = new Date(query.date);
    } else if (query.startDate || query.endDate) {
      whereClause.date = {};
      if (query.startDate) {
        whereClause.date.gte = new Date(query.startDate);
      }
      if (query.endDate) {
        whereClause.date.lte = new Date(query.endDate);
      }
    }

    // Apply time filters
    if (query.startTime) {
      whereClause.startTime = { gte: query.startTime };
    }
    if (query.endTime) {
      whereClause.endTime = { lte: query.endTime };
    }

    // Apply minimum duration filter
    if (query.minDuration) {
      whereClause.slotDuration = { gte: query.minDuration };
    }

    // Apply provider filters
    if (query.specialization || query.city || query.state) {
      whereClause.provider = {};
      if (query.specialization) {
        whereClause.provider.specialization = {
          contains: query.specialization,
          mode: 'insensitive',
        };
      }
      if (query.city) {
        whereClause.provider.clinicCity = {
          contains: query.city,
          mode: 'insensitive',
        };
      }
      if (query.state) {
        whereClause.provider.clinicState = {
          contains: query.state,
          mode: 'insensitive',
        };
      }
    }

    const skip = ((query.page || 1) - 1) * (query.limit || 20);
    const take = query.limit || 20;

    const [availability, total] = await Promise.all([
      this.prisma.providerAvailability.findMany({
        where: whereClause,
        include: {
          provider: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              specialization: true,
              yearsOfExperience: true,
              clinicCity: true,
              clinicState: true,
            },
          },
        },
        skip,
        take,
        orderBy: [
          { date: 'asc' },
          { startTime: 'asc' },
        ],
      }),
      this.prisma.providerAvailability.count({
        where: whereClause,
      }),
    ]);

    const totalPages = Math.ceil(total / take);
    const currentPage = query.page || 1;

    return {
      data: availability.map((slot) => ({
        ...this.mapToResponseDto(slot),
        provider: slot.provider ? {
          id: slot.provider.id,
          firstName: slot.provider.firstName,
          lastName: slot.provider.lastName,
          email: slot.provider.email,
          specialization: slot.provider.specialization,
          yearsOfExperience: slot.provider.yearsOfExperience,
          clinicCity: slot.provider.clinicCity || undefined,
          clinicState: slot.provider.clinicState || undefined,
        } : undefined,
      })),
      total,
      page: currentPage,
      limit: take,
      totalPages,
      hasNextPage: currentPage < totalPages,
      hasPrevPage: currentPage > 1,
    };
  }

  async updateAvailability(
    id: string,
    providerId: string,
    dto: UpdateAvailabilityDto,
  ): Promise<AvailabilityResponseDto> {
    // Check if availability exists and belongs to provider
    const existingAvailability = await this.prisma.providerAvailability.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existingAvailability) {
      throw new NotFoundException('Availability slot not found');
    }

    if (existingAvailability.providerId !== parseInt(providerId, 10)) {
      throw new ForbiddenException('You can only update your own availability slots');
    }

    // Validate time range if being updated
    if (dto.startTime && dto.endTime) {
      this.validateTimeRange(dto.startTime, dto.endTime);
    }

    // Validate date is not in the past if being updated
    if (dto.date) {
      this.validateFutureDate(dto.date);
    }

    // Check for overlapping slots if time or date is being updated
    if (dto.date || dto.startTime || dto.endTime) {
      const date = dto.date || existingAvailability.date.toISOString().split('T')[0];
      const startTime = dto.startTime || existingAvailability.startTime;
      const endTime = dto.endTime || existingAvailability.endTime;
      
      await this.validateNoOverlap(parseInt(providerId, 10), date, startTime, endTime, id);
    }

    // Validate current appointments doesn't exceed max
    if (dto.currentAppointments !== undefined && dto.maxAppointments !== undefined) {
      if (dto.currentAppointments > dto.maxAppointments) {
        throw new BadRequestException('Current appointments cannot exceed maximum appointments');
      }
    }

    const updatedAvailability = await this.prisma.providerAvailability.update({
      where: { id: parseInt(id, 10) },
      data: {
        ...(dto.date && { date: new Date(dto.date) }),
        ...(dto.startTime && { startTime: dto.startTime }),
        ...(dto.endTime && { endTime: dto.endTime }),
        ...(dto.isRecurring !== undefined && { isRecurring: dto.isRecurring }),
        ...(dto.recurrencePattern && { recurrencePattern: dto.recurrencePattern }),
        ...(dto.recurrenceEndDate && { recurrenceEndDate: new Date(dto.recurrenceEndDate) }),
        ...(dto.slotDuration && { slotDuration: dto.slotDuration }),
        ...(dto.status && { status: dto.status }),
        ...(dto.maxAppointments && { maxAppointments: dto.maxAppointments }),
        ...(dto.currentAppointments !== undefined && { currentAppointments: dto.currentAppointments }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.timezone && { timezone: dto.timezone }),
      },
    });

    return this.mapToResponseDto(updatedAvailability);
  }

  async deleteAvailability(id: string, providerId: string): Promise<void> {
    // Check if availability exists and belongs to provider
    const existingAvailability = await this.prisma.providerAvailability.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!existingAvailability) {
      throw new NotFoundException('Availability slot not found');
    }

    if (existingAvailability.providerId !== parseInt(providerId, 10)) {
      throw new ForbiddenException('You can only delete your own availability slots');
    }

    // Check if there are current appointments
    if (existingAvailability.currentAppointments > 0) {
      throw new BadRequestException(
        'Cannot delete availability slot with existing appointments. Cancel appointments first.',
      );
    }

    await this.prisma.providerAvailability.delete({
      where: { id: parseInt(id, 10) },
    });
  }

  private validateTimeRange(startTime: string, endTime: string): void {
    const start = this.timeStringToMinutes(startTime);
    const end = this.timeStringToMinutes(endTime);

    if (start >= end) {
      throw new BadRequestException('End time must be after start time');
    }

    if (end - start < 15) {
      throw new BadRequestException('Minimum slot duration is 15 minutes');
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

  private async validateNoOverlap(
    providerId: number,
    date: string,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ): Promise<void> {
    const whereClause: any = {
      providerId,
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
      whereClause.NOT = { id: parseInt(excludeId, 10) };
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

  private async createRecurringSlots(
    providerId: string,
    dto: CreateAvailabilityDto,
  ): Promise<void> {
    const slots: TimeSlot[] = this.generateRecurringSlots(
      dto.date,
      dto.startTime,
      dto.endTime,
      dto.recurrencePattern!,
      dto.recurrenceEndDate!,
    );

    for (const slot of slots) {
      try {
        // Check for overlaps before creating
        await this.validateNoOverlap(
          parseInt(providerId, 10),
          slot.date.toISOString().split('T')[0],
          slot.startTime,
          slot.endTime,
        );

        await this.prisma.providerAvailability.create({
          data: {
            providerId: parseInt(providerId, 10),
            date: slot.date,
            startTime: slot.startTime,
            endTime: slot.endTime,
            isRecurring: true,
            recurrencePattern: dto.recurrencePattern,
            recurrenceEndDate: new Date(dto.recurrenceEndDate!),
            slotDuration: dto.slotDuration || 30,
            maxAppointments: dto.maxAppointments || 1,
            notes: dto.notes,
            timezone: dto.timezone || 'UTC',
          },
        });
      } catch (error) {
        // Log error but continue with other slots
        console.warn(`Failed to create recurring slot for ${slot.date}: ${error.message}`);
      }
    }
  }

  private generateRecurringSlots(
    startDate: string,
    startTime: string,
    endTime: string,
    pattern: RecurrencePattern,
    endDate: string,
  ): TimeSlot[] {
    const slots: TimeSlot[] = [];
    let currentDate = new Date(startDate);
    const finalDate = new Date(endDate);

    while (currentDate <= finalDate) {
      // Skip the initial date as it's already created
      if (currentDate.toISOString().split('T')[0] !== startDate) {
        slots.push({
          date: new Date(currentDate),
          startTime,
          endTime,
        });
      }

      // Increment based on pattern
      switch (pattern) {
        case RecurrencePattern.DAILY:
          currentDate.setDate(currentDate.getDate() + 1);
          break;
        case RecurrencePattern.WEEKLY:
          currentDate.setDate(currentDate.getDate() + 7);
          break;
        case RecurrencePattern.MONTHLY:
          currentDate.setMonth(currentDate.getMonth() + 1);
          break;
      }
    }

    return slots;
  }

  private timeStringToMinutes(timeString: string): number {
    const [hours, minutes] = timeString.split(':').map(Number);
    return hours * 60 + minutes;
  }

  private mapToResponseDto(availability: ProviderAvailability): AvailabilityResponseDto {
    return {
      id: availability.id,
      providerId: availability.providerId,
      date: availability.date.toISOString().split('T')[0],
      startTime: availability.startTime,
      endTime: availability.endTime,
      isRecurring: availability.isRecurring,
      recurrencePattern: availability.recurrencePattern || undefined,
      recurrenceEndDate: availability.recurrenceEndDate?.toISOString().split('T')[0],
      slotDuration: availability.slotDuration,
      status: availability.status,
      maxAppointments: availability.maxAppointments,
      currentAppointments: availability.currentAppointments,
      notes: availability.notes || undefined,
      timezone: availability.timezone,
      createdAt: availability.createdAt,
      updatedAt: availability.updatedAt,
    };
  }
} 