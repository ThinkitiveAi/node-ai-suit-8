import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsNotEmpty,
  IsInt,
  IsOptional,
  ValidateNested,
  MinLength,
  MaxLength,
  Min,
  Max,
} from 'class-validator';
import { Type } from 'class-transformer';

export class ClinicAddressDto {
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

export class RegisterProviderDto {
  @ApiProperty({ description: 'First name', example: 'Dr. Jane' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  firstName: string;

  @ApiProperty({ description: 'Last name', example: 'Smith' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  lastName: string;

  @ApiProperty({ description: 'Email address', example: 'dr.jane.smith@example.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ description: 'Phone number', example: '+1234567890' })
  @IsNotEmpty()
  @IsString()
  @MinLength(10)
  @MaxLength(20)
  phoneNumber: string;

  @ApiProperty({ 
    description: 'Password (min 8 chars, must contain uppercase, lowercase, number, special char)',
    example: 'SecurePassword123!'
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;

  @ApiProperty({ description: 'Medical specialization', example: 'Cardiology' })
  @IsNotEmpty()
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  specialization: string;

  @ApiProperty({ description: 'Medical license number', example: 'MD123456' })
  @IsNotEmpty()
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  licenseNumber: string;

  @ApiPropertyOptional({ 
    description: 'Years of experience',
    minimum: 0,
    maximum: 60,
    example: 5
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(60)
  yearsOfExperience?: number;

  @ApiPropertyOptional({ 
    description: 'Clinic address information',
    type: ClinicAddressDto
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => ClinicAddressDto)
  clinicAddress?: ClinicAddressDto;
} 