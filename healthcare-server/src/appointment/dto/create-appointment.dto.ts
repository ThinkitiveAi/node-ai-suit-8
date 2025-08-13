import { IsString, IsNumber, IsEnum, IsDateString, IsOptional, IsUUID, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AppointmentMode {
  IN_PERSON = 'IN_PERSON',
  VIDEO_CALL = 'VIDEO_CALL',
  HOME = 'HOME',
}

export class CreateAppointmentDto {
  @ApiProperty({
    description: 'Patient UUID',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @IsUUID()
  patientId: string;

  @ApiProperty({
    description: 'Provider UUID',
    example: '123e4567-e89b-12d3-a456-426614174001'
  })
  @IsUUID()
  providerId: string;

  @ApiProperty({
    description: 'Type of appointment',
    example: 'General Checkup'
  })
  @IsString()
  appointmentType: string;

  @ApiProperty({
    description: 'Mode of appointment',
    enum: AppointmentMode,
    example: AppointmentMode.IN_PERSON
  })
  @IsEnum(AppointmentMode)
  appointmentMode: AppointmentMode;

  @ApiProperty({
    description: 'Scheduled date and time',
    example: '2024-01-15T10:00:00Z'
  })
  @IsDateString()
  scheduledDate: string;

  @ApiProperty({
    description: 'Estimated amount in dollars',
    example: 150.00,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  @Max(999999.99)
  estimatedAmount: number;

  @ApiPropertyOptional({
    description: 'Reason for the visit',
    example: 'Annual checkup and blood work'
  })
  @IsOptional()
  @IsString()
  reasonForVisit?: string;

  @ApiPropertyOptional({
    description: 'Additional notes',
    example: 'Patient prefers morning appointments'
  })
  @IsOptional()
  @IsString()
  notes?: string;
} 