import { ApiPropertyOptional } from '@nestjs/swagger';
import { PartialType } from '@nestjs/mapped-types';
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
} from 'class-validator';
import { Transform } from 'class-transformer';
import { AvailabilityStatus, RecurrencePattern } from '@prisma/client';
import { CreateAvailabilityDto } from './create-availability.dto';

export class UpdateAvailabilityDto extends PartialType(CreateAvailabilityDto) {
  @ApiPropertyOptional({
    description: 'Status of the availability slot',
    enum: AvailabilityStatus,
    example: AvailabilityStatus.AVAILABLE,
  })
  @IsOptional()
  @IsEnum(AvailabilityStatus)
  status?: AvailabilityStatus;

  @ApiPropertyOptional({
    description: 'Current number of appointments booked',
    example: 0,
    minimum: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0, { message: 'Current appointments cannot be negative' })
  @Transform(({ value }) => parseInt(value, 10))
  currentAppointments?: number;
} 