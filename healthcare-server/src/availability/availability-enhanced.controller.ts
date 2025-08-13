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
import { AvailabilityEnhancedService } from './availability-enhanced.service';
import {
  CreateComprehensiveAvailabilityDto,
  CreateProviderSettingsDto,
  UpdateProviderSettingsDto,
  CreateBlockDayDto,
  UpdateBlockDayDto,
  ProviderSettingsResponseDto,
  BlockDayResponseDto,
} from './dto';
import { ApiResponseDto } from '../common/dto/api-response.dto';

interface JwtUser {
  id: string;
  email: string;
  role: UserRole;
}

@ApiTags('Enhanced Provider Availability')
@Controller('api/v1')
export class AvailabilityEnhancedController {
  constructor(
    private readonly availabilityEnhancedService: AvailabilityEnhancedService,
  ) {}

  @Post('provider/availability/comprehensive')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create comprehensive availability',
    description: 'Create availability with day slots, time slots, provider settings, and block days.',
  })
  @ApiResponse({
    status: 201,
    description: 'Comprehensive availability created successfully',
  })
  async createComprehensiveAvailability(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateComprehensiveAvailabilityDto,
  ) {
    return this.availabilityEnhancedService.createComprehensiveAvailability(
      user.id,
      dto,
    );
  }

  @Get('provider/settings/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get provider availability settings',
    description: 'Get availability settings for the authenticated provider.',
  })
  @ApiResponse({
    status: 200,
    description: 'Provider settings retrieved successfully',
    type: ApiResponseDto<ProviderSettingsResponseDto>,
  })
  async getProviderSettings(@CurrentUser() user: JwtUser) {
    const settings = await this.availabilityEnhancedService.getProviderSettings(
      user.id,
    );

    return {
      success: true,
      message: 'Provider settings retrieved successfully',
      data: settings,
    };
  }

  @Post('provider/settings/availability')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create or update provider availability settings',
    description: 'Create or update availability settings for the authenticated provider.',
  })
  @ApiResponse({
    status: 201,
    description: 'Provider settings created/updated successfully',
    type: ApiResponseDto<ProviderSettingsResponseDto>,
  })
  async upsertProviderSettings(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateProviderSettingsDto,
  ) {
    const settings = await this.availabilityEnhancedService.upsertProviderSettings(
      user.id,
      dto,
    );

    return {
      success: true,
      message: 'Provider settings saved successfully',
      data: settings,
    };
  }

  @Get('provider/block-days')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Get provider block days',
    description: 'Get blocked days for the authenticated provider.',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter by start date (YYYY-MM-DD)',
    example: '2024-01-15',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter by end date (YYYY-MM-DD)',
    example: '2024-01-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Block days retrieved successfully',
    type: ApiResponseDto<BlockDayResponseDto[]>,
  })
  async getProviderBlockDays(
    @CurrentUser() user: JwtUser,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const blockDays = await this.availabilityEnhancedService.getProviderBlockDays(
      user.id,
      startDate,
      endDate,
    );

    return {
      success: true,
      message: 'Block days retrieved successfully',
      data: blockDays,
    };
  }

  @Post('provider/block-days')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create block day',
    description: 'Create a blocked day for the authenticated provider.',
  })
  @ApiResponse({
    status: 201,
    description: 'Block day created successfully',
    type: ApiResponseDto<BlockDayResponseDto>,
  })
  async createBlockDay(
    @CurrentUser() user: JwtUser,
    @Body() dto: CreateBlockDayDto,
  ) {
    const blockDay = await this.availabilityEnhancedService.createBlockDay(
      user.id,
      dto,
    );

    return {
      success: true,
      message: 'Block day created successfully',
      data: blockDay,
    };
  }

  @Post('provider/block-days/bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.PROVIDER)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Create multiple block days',
    description: 'Create multiple blocked days for the authenticated provider.',
  })
  @ApiResponse({
    status: 201,
    description: 'Block days created successfully',
    type: ApiResponseDto<BlockDayResponseDto[]>,
  })
  async createBulkBlockDays(
    @CurrentUser() user: JwtUser,
    @Body() dto: { blockDays: CreateBlockDayDto[] },
  ) {
    const blockDays = await this.availabilityEnhancedService.createBulkBlockDays(
      user.id,
      dto.blockDays,
    );

    return {
      success: true,
      message: 'Block days created successfully',
      data: blockDays,
    };
  }

  @Get('providers/:providerId/availability/enhanced')
  @ApiOperation({
    summary: 'Get enhanced provider availability',
    description: 'Get comprehensive availability information for a specific provider including settings and block days.',
  })
  @ApiParam({
    name: 'providerId',
    description: 'Provider ID',
    example: '1',
  })
  @ApiQuery({
    name: 'startDate',
    required: false,
    description: 'Filter by start date (YYYY-MM-DD)',
    example: '2024-01-15',
  })
  @ApiQuery({
    name: 'endDate',
    required: false,
    description: 'Filter by end date (YYYY-MM-DD)',
    example: '2024-01-31',
  })
  @ApiResponse({
    status: 200,
    description: 'Enhanced provider availability retrieved successfully',
  })
  async getEnhancedProviderAvailability(
    @Param('providerId') providerId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const [settings, blockDays] = await Promise.all([
      this.availabilityEnhancedService.getProviderSettings(providerId),
      this.availabilityEnhancedService.getProviderBlockDays(
        providerId,
        startDate,
        endDate,
      ),
    ]);

    return {
      success: true,
      message: 'Enhanced provider availability retrieved successfully',
      data: {
        settings,
        blockDays,
      },
    };
  }

  @Get('availability/calendar/:providerId')
  @ApiOperation({
    summary: 'Get provider availability calendar',
    description: 'Get calendar view of provider availability with all time slots, settings, and blocked days.',
  })
  @ApiParam({
    name: 'providerId',
    description: 'Provider ID',
    example: '1',
  })
  @ApiQuery({
    name: 'month',
    required: false,
    description: 'Month to view (YYYY-MM)',
    example: '2024-01',
  })
  @ApiResponse({
    status: 200,
    description: 'Provider calendar retrieved successfully',
  })
  async getProviderCalendar(
    @Param('providerId') providerId: string,
    @Query('month') month?: string,
  ) {
    let startDate: string;
    let endDate: string;

    if (month) {
      // Parse month (YYYY-MM) and get first and last day
      const [year, monthNum] = month.split('-');
      startDate = `${year}-${monthNum.padStart(2, '0')}-01`;
      const lastDay = new Date(parseInt(year), parseInt(monthNum), 0).getDate();
      endDate = `${year}-${monthNum.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
    } else {
      // Default to current month
      const now = new Date();
      const year = now.getFullYear();
      const monthNum = now.getMonth() + 1;
      startDate = `${year}-${monthNum.toString().padStart(2, '0')}-01`;
      const lastDay = new Date(year, monthNum, 0).getDate();
      endDate = `${year}-${monthNum.toString().padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}`;
    }

    const [settings, blockDays] = await Promise.all([
      this.availabilityEnhancedService.getProviderSettings(providerId),
      this.availabilityEnhancedService.getProviderBlockDays(
        providerId,
        startDate,
        endDate,
      ),
    ]);

    return {
      success: true,
      message: 'Provider calendar retrieved successfully',
      data: {
        month: month || new Date().toISOString().slice(0, 7),
        startDate,
        endDate,
        settings,
        blockDays,
      },
    };
  }
} 