import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  AvailabilityStatus,
  RecurrencePattern,
  ProviderAvailability,
} from '@prisma/client';

export class ProviderSummaryDto {
  @ApiProperty({
    description: 'Provider ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Provider first name',
    example: 'Dr. Jane',
  })
  firstName: string;

  @ApiProperty({
    description: 'Provider last name',
    example: 'Smith',
  })
  lastName: string;

  @ApiProperty({
    description: 'Provider email',
    example: 'dr.jane.smith@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'Provider specialization',
    example: 'Cardiology',
  })
  specialization: string;

  @ApiProperty({
    description: 'Years of experience',
    example: 10,
  })
  yearsOfExperience: number;

  @ApiPropertyOptional({
    description: 'Clinic city',
    example: 'New York',
  })
  clinicCity?: string;

  @ApiPropertyOptional({
    description: 'Clinic state',
    example: 'NY',
  })
  clinicState?: string;
}

export class AvailabilityResponseDto {
  @ApiProperty({
    description: 'Availability slot ID',
    example: 1,
  })
  id: number;

  @ApiProperty({
    description: 'Provider ID',
    example: 1,
  })
  providerId: number;

  @ApiProperty({
    description: 'Date of availability',
    example: '2024-01-15',
    format: 'date',
  })
  date: string;

  @ApiProperty({
    description: 'Start time',
    example: '09:00',
  })
  startTime: string;

  @ApiProperty({
    description: 'End time',
    example: '17:00',
  })
  endTime: string;

  @ApiProperty({
    description: 'Whether this is a recurring slot',
    example: false,
  })
  isRecurring: boolean;

  @ApiPropertyOptional({
    description: 'Recurrence pattern',
    enum: RecurrencePattern,
    example: RecurrencePattern.WEEKLY,
  })
  recurrencePattern?: RecurrencePattern;

  @ApiPropertyOptional({
    description: 'Recurrence end date',
    example: '2024-12-31',
    format: 'date',
  })
  recurrenceEndDate?: string;

  @ApiProperty({
    description: 'Slot duration in minutes',
    example: 30,
  })
  slotDuration: number;

  @ApiProperty({
    description: 'Current status',
    enum: AvailabilityStatus,
    example: AvailabilityStatus.AVAILABLE,
  })
  status: AvailabilityStatus;

  @ApiProperty({
    description: 'Maximum appointments',
    example: 1,
  })
  maxAppointments: number;

  @ApiProperty({
    description: 'Current appointments',
    example: 0,
  })
  currentAppointments: number;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Emergency consultations only',
  })
  notes?: string;

  @ApiProperty({
    description: 'Provider timezone',
    example: 'America/New_York',
  })
  timezone: string;

  @ApiProperty({
    description: 'Created timestamp',
    example: '2024-01-15T10:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Updated timestamp',
    example: '2024-01-15T10:00:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Provider information (included in search results)',
    type: ProviderSummaryDto,
  })
  provider?: ProviderSummaryDto;
}

export class PaginatedAvailabilityResponseDto {
  @ApiProperty({
    description: 'List of availability slots',
    type: [AvailabilityResponseDto],
  })
  data: AvailabilityResponseDto[];

  @ApiProperty({
    description: 'Total number of available slots',
    example: 150,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of results per page',
    example: 20,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 8,
  })
  totalPages: number;

  @ApiProperty({
    description: 'Whether there are more pages',
    example: true,
  })
  hasNextPage: boolean;

  @ApiProperty({
    description: 'Whether there are previous pages',
    example: false,
  })
  hasPrevPage: boolean;
}

export class BulkOperationResponseDto {
  @ApiProperty({
    description: 'Number of slots successfully created/updated',
    example: 5,
  })
  successful: number;

  @ApiProperty({
    description: 'Number of slots that failed',
    example: 0,
  })
  failed: number;

  @ApiProperty({
    description: 'Details of created/updated slots',
    type: [AvailabilityResponseDto],
  })
  results: AvailabilityResponseDto[];

  @ApiProperty({
    description: 'Error details for failed operations',
    type: [String],
    example: [],
  })
  errors: string[];
} 