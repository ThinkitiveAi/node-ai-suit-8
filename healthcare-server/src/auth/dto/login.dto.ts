import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ 
    description: 'Email address or phone number',
    example: 'john.doe@example.com'
  })
  @IsNotEmpty()
  @IsString()
  emailOrPhone: string;

  @ApiProperty({ 
    description: 'Password',
    example: 'Password123!'
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  password: string;
} 