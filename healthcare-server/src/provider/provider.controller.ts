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
import { ProviderService } from './provider.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { CurrentUser, CurrentUserData } from '../common/decorators/current-user.decorator';
import { UpdateProviderDto } from './dto/update-provider.dto';

@ApiTags('Provider')
@Controller('api/v1/provider')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.PROVIDER)
@ApiBearerAuth('JWT-auth')
export class ProviderController {
  constructor(private readonly providerService: ProviderService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Get provider profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'Provider profile retrieved successfully',
    schema: {
      example: {
        success: true,
        message: 'Provider profile retrieved successfully',
        data: {
          id: 'uuid',
          firstName: 'Dr. Jane',
          lastName: 'Smith',
          email: 'dr.jane.smith@example.com',
          phoneNumber: '+1234567890',
          specialization: 'Cardiology',
          licenseNumber: 'MD123456',
          yearsOfExperience: 5,
          clinicAddress: {
            street: '123 Medical Center Dr',
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
  @ApiResponse({ status: 403, description: 'Forbidden - Provider role required' })
  async getProfile(@CurrentUser() user: CurrentUserData) {
    console.log("user ------------>", user);
    return this.providerService.findById(user.id);
  }

  @Patch('profile')
  @ApiOperation({ summary: 'Update provider profile' })
  @ApiResponse({ 
    status: 200, 
    description: 'Provider profile updated successfully',
    schema: {
      example: {
        success: true,
        message: 'Provider profile updated successfully',
        data: {
          id: 'uuid',
          firstName: 'Dr. Jane',
          lastName: 'Smith',
          email: 'dr.jane.smith@example.com',
          phoneNumber: '+1234567890',
          specialization: 'Cardiology',
          licenseNumber: 'MD123456',
          yearsOfExperience: 6,
          clinicAddress: {
            street: '456 Updated Medical Center Dr',
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
  @ApiResponse({ status: 403, description: 'Forbidden - Provider role required' })
  async updateProfile(
    @CurrentUser() user: CurrentUserData,
    @Body() dto: UpdateProviderDto,
  ) {
    return this.providerService.update(user.id, dto);
  }
} 