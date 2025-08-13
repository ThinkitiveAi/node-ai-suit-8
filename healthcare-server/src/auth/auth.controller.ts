import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Get,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { AuthService } from './auth.service';
import { LoginDto, RegisterPatientDto, RegisterProviderDto, AuthResponseDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('api/v1')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('patient/register')
  @ApiOperation({ summary: 'Register a new patient' })
  @ApiResponse({ 
    status: 201, 
    description: 'Patient registered successfully',
    schema: {
      example: {
        success: true,
        message: 'Patient registered successfully',
        data: {
          user: {
            id: 'uuid',
            email: 'patient@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'patient'
          },
          tokens: {
            accessToken: 'jwt_access_token',
            refreshToken: 'jwt_refresh_token'
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Email or phone already exists' })
  async registerPatient(@Body() dto: RegisterPatientDto): Promise<AuthResponseDto> {
    return this.authService.registerPatient(dto);
  }

  @Post('provider/register')
  @ApiOperation({ summary: 'Register a new healthcare provider' })
  @ApiResponse({ 
    status: 201, 
    description: 'Provider registered successfully',
    schema: {
      example: {
        success: true,
        message: 'Provider registered successfully',
        data: {
          user: {
            id: 'uuid',
            email: 'provider@example.com',
            firstName: 'Dr. Jane',
            lastName: 'Smith',
            role: 'provider'
          },
          tokens: {
            accessToken: 'jwt_access_token',
            refreshToken: 'jwt_refresh_token'
          }
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 409, description: 'Email, phone, or license number already exists' })
  async registerProvider(@Body() dto: RegisterProviderDto): Promise<AuthResponseDto> {
    return this.authService.registerProvider(dto);
  }

  @Post('patient/login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @ApiOperation({ summary: 'Patient login' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    schema: {
      example: {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: 'uuid',
            email: 'patient@example.com',
            firstName: 'John',
            lastName: 'Doe',
            role: 'patient'
          },
          tokens: {
            accessToken: 'jwt_access_token',
            refreshToken: 'jwt_refresh_token'
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many login attempts' })
  async loginPatient(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.loginPatient(dto);
  }

  @Post('provider/login')
  @HttpCode(HttpStatus.OK)
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 attempts per minute
  @ApiOperation({ summary: 'Provider login' })
  @ApiResponse({ 
    status: 200, 
    description: 'Login successful',
    schema: {
      example: {
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: 'uuid',
            email: 'provider@example.com',
            firstName: 'Dr. Jane',
            lastName: 'Smith',
            role: 'provider'
          },
          tokens: {
            accessToken: 'jwt_access_token',
            refreshToken: 'jwt_refresh_token'
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  @ApiResponse({ status: 429, description: 'Too many login attempts' })
  async loginProvider(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.loginProvider(dto);
  }

  @Post('auth/refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token refreshed successfully',
    schema: {
      example: {
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: 'new_jwt_access_token'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  @Post('auth/logout')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ 
    status: 200, 
    description: 'Logged out successfully',
    schema: {
      example: {
        success: true,
        message: 'Logged out successfully'
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async logout(
    @Body('refreshToken') refreshToken: string,
    @CurrentUser() user: CurrentUserData,
  ) {
    await this.authService.logout(refreshToken);
    return { message: 'Logged out successfully' };
  }

  @Get('debug/token')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Debug JWT token - Test authentication' })
  @ApiResponse({ 
    status: 200, 
    description: 'Token is valid',
    schema: {
      example: {
        success: true,
        message: 'Token is valid',
        data: {
          user: {
            id: 'uuid',
            email: 'user@example.com',
            role: 'patient'
          },
          tokenInfo: {
            isValid: true,
            message: 'Authentication successful'
          }
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Token is invalid or missing' })
  @ApiBearerAuth('JWT-auth')
  async debugToken(@CurrentUser() user: CurrentUserData) {
    console.log('Debug endpoint - User data:', user);
    return {
      success: true,
      message: 'Token is valid',
      data: {
        user,
        tokenInfo: {
          isValid: true,
          message: 'Authentication successful'
        }
      }
    };
  }
} 