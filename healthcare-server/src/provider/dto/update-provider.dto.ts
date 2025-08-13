import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  ValidateNested,
  MinLength,
  MaxLength,
  IsInt,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateClinicAddressDto {
  @ApiPropertyOptional({ description: 'Clinic street address' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  street?: string;

  @ApiPropertyOptional({ description: 'Clinic city' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'Clinic state' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  state?: string;

  @ApiPropertyOptional({ description: 'Clinic ZIP code' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  zip?: string;
}

export class UpdateProviderDto {
  @ApiPropertyOptional({ description: 'First name' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  firstName?: string;

  @ApiPropertyOptional({ description: 'Last name' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  lastName?: string;

  @ApiPropertyOptional({ description: 'Phone number' })
  @IsOptional()
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  phoneNumber?: string;

  @ApiPropertyOptional({ description: 'Medical specialization' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  specialization?: string;

  @ApiPropertyOptional({ 
    description: 'Years of experience',
    minimum: 0,
    maximum: 60
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(60)
  yearsOfExperience?: number;

  @ApiPropertyOptional({ 
    description: 'Clinic address information',
    type: UpdateClinicAddressDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateClinicAddressDto)
  clinicAddress?: UpdateClinicAddressDto;
} 