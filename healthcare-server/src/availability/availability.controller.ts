import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AvailabilityService } from './availability.service';
import {
  CreateAvailabilityDto,
  CreateBulkAvailabilityDto,
  UpdateAvailabilityDto,
  SearchAvailabilityDto,
  AvailabilityResponseDto,
  PaginatedAvailabilityResponseDto,
  BulkOperationResponseDto,
} from './dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';

interface JwtUser {
  id: string;
  email: string;
  role: UserRole;
}

@ApiTags('Provider Availability')
@Controller('api/v1')
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post('provider/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create availability slot',
    description: 'Create a new availability slot for the authenticated provider. Supports recurring appointments.',
  })
  @ApiResponse({
    status: 201,
    description: 'Availability slot created successfully',
    type: ApiResponseDto<AvailabilityResponseDto>,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data or time conflicts',
  })
  @ApiResponse({
    status: 409,
    description: 'Time slot overlaps with existing availability',
  })
  async createAvailability(
    @CurrentUser() user: JwtUser,
    @Body() createAvailabilityDto: CreateAvailabilityDto,
  ): Promise<ApiResponseDto<AvailabilityResponseDto>> {
    const result = await this.availabilityService.createAvailability(
      user.id,
      createAvailabilityDto,
    );

    return {
      success: true,
      message: 'Availability slot created successfully',
      data: result,
    };
  }

  @Post('provider/availability/bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create multiple availability slots',
    description: 'Create multiple availability slots in a single request. Useful for bulk operations.',
  })
  @ApiResponse({
    status: 201,
    description: 'Bulk availability creation completed',
    type: ApiResponseDto<BulkOperationResponseDto>,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  async createBulkAvailability(
    @CurrentUser() user: JwtUser,
    @Body() createBulkDto: CreateBulkAvailabilityDto,
  ): Promise<ApiResponseDto<BulkOperationResponseDto>> {
    const result = await this.availabilityService.createBulkAvailability(
      user.id,
      createBulkDto,
    );

    return {
      success: true,
      message: 'Bulk availability creation completed',
      data: result,
    };
  }

  @Get('provider/:id/availability')
  @ApiOperation({
    summary: 'Get provider availability',
    description: 'Fetch all available slots for a specific provider with filtering options.',
  })
  @ApiParam({
    name: 'id',
    description: 'Provider ID',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Provider availability retrieved successfully',
    type: ApiResponseDto<PaginatedAvailabilityResponseDto>,
  })
  @ApiResponse({
    status: 404,
    description: 'Provider not found',
  })
  async getProviderAvailability(
    @Param('id') providerId: string,
    @Query() query: SearchAvailabilityDto,
  ): Promise<ApiResponseDto<PaginatedAvailabilityResponseDto>> {
    const result = await this.availabilityService.getProviderAvailability(
      providerId,
      query,
    );

    return {
      success: true,
      message: 'Provider availability retrieved successfully',
      data: result,
    };
  }

  @Get('availability/search')
  @ApiOperation({
    summary: 'Search available providers',
    description: 'Search for available providers based on date, time, specialization, and location filters.',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Filter by specific date (YYYY-MM-DD)',
    example: '2024-01-15',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter by start date range (YYYY-MM-DD)',
    example: '2024-01-15',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter by end date range (YYYY-MM-DD)',
    example: '2024-01-31',
  })
  @ApiQuery({
    name: 'startTime',
    required: false,
    description: 'Filter by start time (HH:mm)',
    example: '09:00',
  })
  @ApiQuery({
    name: 'endTime',
    required: false,
    description: 'Filter by end time (HH:mm)',
    example: '17:00',
  })
  @ApiQuery({
    name: 'specialization',
    required: false,
    description: 'Filter by provider specialization',
    example: 'Cardiology',
  })
  @ApiQuery({
    name: 'city',
    required: false,
    description: 'Filter by clinic city',
    example: 'New York',
  })
  @ApiQuery({
    name: 'state',
    required: false,
    description: 'Filter by clinic state',
    example: 'NY',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number for pagination',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of results per page',
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Available providers found',
    type: ApiResponseDto<PaginatedAvailabilityResponseDto>,
  })
  async searchAvailability(
    @Query() query: SearchAvailabilityDto,
  ): Promise<ApiResponseDto<PaginatedAvailabilityResponseDto>> {
    const result = await this.availabilityService.searchAvailability(query);

    return {
      success: true,
      message: 'Available providers found',
      data: result,
    };
  }

  @Put('provider/availability/:slotId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Update availability slot',
    description: 'Update a specific availability slot. Only the slot owner can update it.',
  })
  @ApiParam({
    name: 'slotId',
    description: 'Availability slot ID',
    example: '1',
  })
  @ApiResponse({
    status: 200,
    description: 'Availability slot updated successfully',
    type: ApiResponseDto<AvailabilityResponseDto>,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only update own slots',
  })
  @ApiResponse({
    status: 404,
    description: 'Availability slot not found',
  })
  async updateAvailability(
    @CurrentUser() user: JwtUser,
    @Param('slotId') slotId: string,
    @Body() updateAvailabilityDto: UpdateAvailabilityDto,
  ): Promise<ApiResponseDto<AvailabilityResponseDto>> {
    const result = await this.availabilityService.updateAvailability(
      slotId,
      user.id,
      updateAvailabilityDto,
    );

    return {
      success: true,
      message: 'Availability slot updated successfully',
      data: result,
    };
  }

  @Delete('provider/availability/:slotId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth('JWT-auth')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete availability slot',
    description: 'Delete a specific availability slot. Only the slot owner can delete it.',
  })
  @ApiParam({
    name: 'slotId',
    description: 'Availability slot ID',
    example: '1',
  })
  @ApiResponse({
    status: 204,
    description: 'Availability slot deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only delete own slots',
  })
  @ApiResponse({
    status: 404,
    description: 'Availability slot not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Cannot delete slot with existing appointments',
  })
  async deleteAvailability(
    @CurrentUser() user: JwtUser,
    @Param('slotId') slotId: string,
  ): Promise<void> {
    await this.availabilityService.deleteAvailability(slotId, user.id);
  }

  @Get('provider/availability/my')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get my availability',
    description: 'Get availability slots for the authenticated provider.',
  })
  @ApiResponse({
    status: 200,
    description: 'My availability retrieved successfully',
    type: ApiResponseDto<PaginatedAvailabilityResponseDto>,
  })
  async getMyAvailability(
    @CurrentUser() user: JwtUser,
    @Query() query: SearchAvailabilityDto,
  ): Promise<ApiResponseDto<PaginatedAvailabilityResponseDto>> {
    const result = await this.availabilityService.getProviderAvailability(
      user.id,
      query,
    );

    return {
      success: true,
      message: 'My availability retrieved successfully',
      data: result,
    };
  }
} 