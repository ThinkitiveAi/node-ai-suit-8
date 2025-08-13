import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsDateString,
  IsBoolean,
  IsOptional,
  Matches,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateBlockDayDto {
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

export class UpdateBlockDayDto extends CreateBlockDayDto {}

export class BlockDayResponseDto {
  @ApiProperty({ description: 'Block day ID' })
  id: string;

  @ApiProperty({ description: 'Provider ID' })
  providerId: string;

  @ApiProperty({ description: 'Blocked date' })
  date: string;

  @ApiProperty({ description: 'Start time (null for full day)' })
  startTime: string | null;

  @ApiProperty({ description: 'End time (null for full day)' })
  endTime: string | null;

  @ApiProperty({ description: 'Whether entire day is blocked' })
  isFullDay: boolean;

  @ApiProperty({ description: 'Reason for blocking' })
  reason: string | null;

  @ApiProperty({ description: 'Creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'Update timestamp' })
  updatedAt: Date;
} 