import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  IsBoolean,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
  Matches,
  ValidateIf,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { RecurrencePattern } from '@prisma/client';

export class CreateAvailabilityDto {
  @ApiProperty({
    description: 'Date for the availability slot',
    example: '2024-01-15',
    format: 'date',
  })
  @IsDateString()
  date: string;

  @ApiProperty({
    description: 'Start time in HH:mm format',
    example: '09:00',
    pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:mm format (24-hour)',
  })
  startTime: string;

  @ApiProperty({
    description: 'End time in HH:mm format',
    example: '17:00',
    pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:mm format (24-hour)',
  })
  endTime: string;

  @ApiPropertyOptional({
    description: 'Whether this is a recurring slot',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isRecurring?: boolean = false;

  @ApiPropertyOptional({
    description: 'Recurrence pattern for recurring slots',
    enum: RecurrencePattern,
    example: RecurrencePattern.WEEKLY,
  })
  @IsOptional()
  @IsEnum(RecurrencePattern)
  @ValidateIf((o) => o.isRecurring === true)
  recurrencePattern?: RecurrencePattern;

  @ApiPropertyOptional({
    description: 'End date for recurring slots',
    example: '2024-12-31',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  @ValidateIf((o) => o.isRecurring === true)
  recurrenceEndDate?: string;

  @ApiPropertyOptional({
    description: 'Duration of each slot in minutes',
    example: 30,
    minimum: 15,
    maximum: 480,
    default: 30,
  })
  @IsOptional()
  @IsInt()
  @Min(15, { message: 'Slot duration must be at least 15 minutes' })
  @Max(480, { message: 'Slot duration cannot exceed 8 hours (480 minutes)' })
  @Transform(({ value }) => parseInt(value, 10))
  slotDuration?: number = 30;

  @ApiPropertyOptional({
    description: 'Maximum number of appointments for this slot',
    example: 1,
    minimum: 1,
    maximum: 20,
    default: 1,
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Maximum appointments must be at least 1' })
  @Max(20, { message: 'Maximum appointments cannot exceed 20' })
  @Transform(({ value }) => parseInt(value, 10))
  maxAppointments?: number = 1;

  @ApiPropertyOptional({
    description: 'Optional notes for the availability slot',
    example: 'Emergency consultations only',
  })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({
    description: 'Provider timezone (defaults to UTC)',
    example: 'America/New_York',
    default: 'UTC',
  })
  @IsOptional()
  @IsString()
  timezone?: string = 'UTC';
}

export class CreateBulkAvailabilityDto {
  @ApiProperty({
    description: 'Array of availability slots to create',
    type: [CreateAvailabilityDto],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one availability slot is required' })
  slots: CreateAvailabilityDto[];
} 