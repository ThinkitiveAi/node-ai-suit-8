import { ApiProperty } from '@nestjs/swagger';
import { AppointmentStatus } from '@prisma/client';

export class AppointmentResponseDto {
  @ApiProperty({
    description: 'Appointment UUID',
    example: '123e4567-e89b-12d3-a456-426614174002'
  })
  uuid: string;

  @ApiProperty({
    description: 'Patient UUID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  patientId: string;

  @ApiProperty({
    description: 'Provider UUID',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  providerId: string;

  @ApiProperty({
    description: 'Type of appointment',
    example: 'General Checkup'
  })
  appointmentType: string;

  @ApiProperty({
    description: 'Mode of appointment',
    example: 'IN_PERSON'
  })
  appointmentMode: string;

  @ApiProperty({
    description: 'Scheduled date and time',
    example: '2024-01-15T10:00:00Z'
  })
  scheduledDate: Date;

  @ApiProperty({
    description: 'Estimated amount in dollars',
    example: 150.00
  })
  estimatedAmount: number;

  @ApiProperty({
    description: 'Reason for the visit',
    example: 'Annual checkup and blood work'
  })
  reasonForVisit?: string | null;

  @ApiProperty({
    description: 'Appointment status',
    enum: AppointmentStatus,
    example: AppointmentStatus.SCHEDULED
  })
  status: AppointmentStatus;

  @ApiProperty({
    description: 'Additional notes',
    example: 'Patient prefers morning appointments'
  })
  notes?: string | null;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-10T08:00:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-10T08:00:00Z'
  })
  updatedAt: Date;
} 