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
  ValidateNested,
  IsArray,
  ArrayMinSize,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { BookingWindowType, NoticeType, DayOfWeek } from '../types';

export class TimeSlotDto {
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
    description: 'Physical location or "Virtual"',
    example: 'Room 101, Main Clinic',
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Whether this is a virtual appointment slot',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isVirtual?: boolean = false;
}

export class DaySlotDto {
  @ApiProperty({
    description: 'Day of the week',
    example: DayOfWeek.MONDAY,
    enum: DayOfWeek
  })
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @ApiProperty({
    description: 'Array of time slots for this day',
    type: [TimeSlotDto],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one time slot is required per day' })
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  timeSlots: TimeSlotDto[];
}

export class BlockDayDto {
  @ApiProperty({
    description: 'Date to block',
    example: '2024-01-15',
    format: 'date',
  })
  @IsDateString()
  date: string;

  @ApiPropertyOptional({
    description: 'Whether to block the entire day',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isFullDay?: boolean = false;

  @ApiPropertyOptional({
    description: 'Start time for partial day block (HH:mm format)',
    example: '14:00',
    pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'startTime must be in HH:mm format (24-hour)',
  })
  startTime?: string;

  @ApiPropertyOptional({
    description: 'End time for partial day block (HH:mm format)',
    example: '16:00',
    pattern: '^([01]?[0-9]|2[0-3]):[0-5][0-9]$',
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'endTime must be in HH:mm format (24-hour)',
  })
  endTime?: string;

  @ApiPropertyOptional({
    description: 'Reason for blocking this time',
    example: 'Personal appointment',
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class ProviderSettingsDto {
  @ApiPropertyOptional({
    description: 'How far in advance patients can book (number)',
    example: 30,
    minimum: 1,
    maximum: 365,
    default: 30,
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Booking window must be at least 1' })
  @Max(365, { message: 'Booking window cannot exceed 365' })
  @Transform(({ value }) => parseInt(value, 10))
  bookingWindowAmount?: number = 30;

  @ApiPropertyOptional({
    description: 'Booking window type (DAYS, WEEKS, MONTHS)',
    enum: BookingWindowType,
    example: BookingWindowType.DAYS,
    default: BookingWindowType.DAYS,
  })
  @IsOptional()
  @IsEnum(BookingWindowType)
  bookingWindowType?: BookingWindowType = BookingWindowType.DAYS;

  @ApiPropertyOptional({
    description: 'Provider timezone',
    example: 'America/New_York',
    default: 'UTC',
  })
  @IsOptional()
  @IsString()
  timezone?: string = 'UTC';

  @ApiPropertyOptional({
    description: 'New appointment consultation time in minutes',
    example: 30,
    minimum: 15,
    maximum: 240,
    default: 30,
  })
  @IsOptional()
  @IsInt()
  @Min(15, { message: 'New appointment duration must be at least 15 minutes' })
  @Max(240, { message: 'New appointment duration cannot exceed 4 hours' })
  @Transform(({ value }) => parseInt(value, 10))
  newAppointmentDuration?: number = 30;

  @ApiPropertyOptional({
    description: 'Follow-up appointment consultation time in minutes',
    example: 15,
    minimum: 15,
    maximum: 240,
    default: 15,
  })
  @IsOptional()
  @IsInt()
  @Min(15, { message: 'Follow-up appointment duration must be at least 15 minutes' })
  @Max(240, { message: 'Follow-up appointment duration cannot exceed 4 hours' })
  @Transform(({ value }) => parseInt(value, 10))
  followUpAppointmentDuration?: number = 15;

  @ApiPropertyOptional({
    description: 'Minimum scheduling notice amount',
    example: 2,
    minimum: 1,
    maximum: 168, // 1 week in hours
    default: 2,
  })
  @IsOptional()
  @IsInt()
  @Min(1, { message: 'Minimum notice amount must be at least 1' })
  @Max(168, { message: 'Minimum notice amount cannot exceed 168 hours' })
  @Transform(({ value }) => parseInt(value, 10))
  minimumNoticeAmount?: number = 2;

  @ApiPropertyOptional({
    description: 'Minimum scheduling notice type (HOURS, DAYS, WEEKS)',
    enum: NoticeType,
    example: NoticeType.HOURS,
    default: NoticeType.HOURS,
  })
  @IsOptional()
  @IsEnum(NoticeType)
  minimumNoticeType?: NoticeType = NoticeType.HOURS;

  @ApiPropertyOptional({
    description: 'Buffer time between appointments in minutes',
    example: 15,
    minimum: 0,
    maximum: 60,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Event buffer cannot be negative' })
  @Max(60, { message: 'Event buffer cannot exceed 60 minutes' })
  @Transform(({ value }) => parseInt(value, 10))
  eventBufferMinutes?: number = 0;
}

export class CreateComprehensiveAvailabilityDto {
  @ApiPropertyOptional({
    description: 'Provider ID (optional, will use authenticated provider if not specified)',
    example: '1',
  })
  @IsOptional()
  @IsString()
  providerId?: string;

  @ApiProperty({
    description: 'Array of day slots with time slots',
    type: [DaySlotDto],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one day slot is required' })
  @ValidateNested({ each: true })
  @Type(() => DaySlotDto)
  daySlots: DaySlotDto[];

  @ApiPropertyOptional({
    description: 'Array of block days',
    type: [BlockDayDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BlockDayDto)
  blockDays?: BlockDayDto[];

  @ApiPropertyOptional({
    description: 'Provider availability settings',
    type: ProviderSettingsDto,
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ProviderSettingsDto)
  settings?: ProviderSettingsDto;

  @ApiPropertyOptional({
    description: 'Start date for the availability period',
    example: '2024-01-15',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'End date for the availability period',
    example: '2024-12-31',
    format: 'date',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({
    description: 'Whether to create recurring weekly availability',
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isRecurring?: boolean = false;
} 