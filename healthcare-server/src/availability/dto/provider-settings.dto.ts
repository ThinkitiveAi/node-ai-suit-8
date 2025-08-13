import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { BookingWindowType, NoticeType } from '../types';

export class CreateProviderSettingsDto {
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
  bookingWindowDays?: number = 30;

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

export class UpdateProviderSettingsDto extends CreateProviderSettingsDto {}

export class ProviderSettingsResponseDto {
  @ApiProperty({ description: 'Settings ID' })
  id: string;

  @ApiProperty({ description: 'Provider ID' })
  providerId: string;

  @ApiProperty({ description: 'Booking window in days' })
  bookingWindowDays: number;

  @ApiProperty({ description: 'Booking window type', enum: BookingWindowType })
  bookingWindowType: BookingWindowType;

  @ApiProperty({ description: 'Provider timezone' })
  timezone: string;

  @ApiProperty({ description: 'New appointment duration in minutes' })
  newAppointmentDuration: number;

  @ApiProperty({ description: 'Follow-up appointment duration in minutes' })
  followUpAppointmentDuration: number;

  @ApiProperty({ description: 'Minimum notice amount' })
  minimumNoticeAmount: number;

  @ApiProperty({ description: 'Minimum notice type', enum: NoticeType })
  minimumNoticeType: NoticeType;

  @ApiProperty({ description: 'Event buffer in minutes' })
  eventBufferMinutes: number;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Update timestamp' })
  updatedAt: Date;
} 