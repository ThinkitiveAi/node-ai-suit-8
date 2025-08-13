import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth 
} from '@nestjs/swagger';
import { PatientService } from './patient.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { UpdatePatientDto } from './dto/update-patient.dto';

@ApiTags('Patient')
@Controller('api/v1/patient')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PATIENT)
@ApiBearerAuth('JWT-auth')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get patient profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'Patient profile retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Patient profile retrieved successfully',
        data: {
          id: 'uuid',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phoneNumber: '+1234567890',
          dateOfBirth: '1990-01-01',
          gender: 'MALE',
          address: {
            street: '123 Main St',
            city: 'New York',
            state: 'NY',
            zip: '10001'
          },
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z'
        }
      }
    }
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Patient role required' })
  async getProfile(@CurrentUser() user: CurrentUserData) {
    return this.patientService.findById(user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update patient profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'Patient profile updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Patient profile updated successfully',
        data: {
          id: 'uuid',
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          phoneNumber: '+1234567890',
          dateOfBirth: '1990-01-01',
          gender: 'MALE',
          address: {
            street: '456 Updated St',
            city: 'New York',
            state: 'NY',
            zip: '10001'
          },
          updatedAt: '2024-01-02T00:00:00.000Z'
        }
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Validation failed' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden - Patient role required' })
  async updateProfile(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: UpdatePatientDto,
  ) {
    return this.patientService.update(user.id, dto);
  }
} 