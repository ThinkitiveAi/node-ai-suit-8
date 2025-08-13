import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { AppointmentService } from './appointment.service';
import { CreateAppointmentDto, UpdateAppointmentDto, AppointmentResponseDto } from './dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles, UserRole } from '../common/decorators/roles.decorator';
import { AppointmentStatus } from '@prisma/client';

@ApiTags('Appointments')
@Controller('appointments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @Post()
  @Roles(UserRole.PATIENT, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Create a new appointment' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Appointment created successfully',
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid appointment data',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Patient or provider not found',
  })
  @ApiResponse({
    status: HttpStatus.CONFLICT,
    description: 'Scheduling conflict',
  })
  create(@Body() createAppointmentDto: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    return this.appointmentService.create(createAppointmentDto);
  }

  @Get()
  @Roles(UserRole.PATIENT, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Get all appointments with pagination and filters' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page' })
  @ApiQuery({ name: 'patientId', required: false, type: String, description: 'Filter by patient UUID' })
  @ApiQuery({ name: 'providerId', required: false, type: String, description: 'Filter by provider UUID' })
  @ApiQuery({ name: 'status', required: false, enum: AppointmentStatus, description: 'Filter by appointment status' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Appointments retrieved successfully',
    schema: {
      type: 'object',
      properties: {
        appointments: {
          type: 'array',
          items: { $ref: '#/components/schemas/AppointmentResponseDto' }
        },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' }
      }
    }
  })
  findAll(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('patientId') patientId?: string,
    @Query('providerId') providerId?: string,
    @Query('status') status?: AppointmentStatus,
  ) {
    return this.appointmentService.findAll(
      page,
      limit,
      patientId,
      providerId,
      status,
    );
  }

  @Get(':uuid')
  @Roles(UserRole.PATIENT, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Get appointment by UUID' })
  @ApiParam({ name: 'uuid', description: 'Appointment UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Appointment retrieved successfully',
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Appointment not found',
  })
  findOne(@Param('uuid') uuid: string): Promise<AppointmentResponseDto> {
    return this.appointmentService.findOne(uuid);
  }

  @Patch(':uuid')
  @Roles(UserRole.PATIENT, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Update appointment by UUID' })
  @ApiParam({ name: 'uuid', description: 'Appointment UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Appointment updated successfully',
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Appointment not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid update data or appointment cannot be updated',
  })
  update(
    @Param('uuid') uuid: string,
    @Body() updateAppointmentDto: UpdateAppointmentDto,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentService.update(uuid, updateAppointmentDto);
  }

  @Patch(':uuid/status')
  @Roles(UserRole.PROVIDER)
  @ApiOperation({ summary: 'Update appointment status' })
  @ApiParam({ name: 'uuid', description: 'Appointment UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Appointment status updated successfully',
    type: AppointmentResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Appointment not found',
  })
  updateStatus(
    @Param('uuid') uuid: string,
    @Body('status') status: AppointmentStatus,
  ): Promise<AppointmentResponseDto> {
    return this.appointmentService.updateStatus(uuid, status);
  }

  @Delete(':uuid')
  @Roles(UserRole.PATIENT, UserRole.PROVIDER)
  @ApiOperation({ summary: 'Delete appointment by UUID' })
  @ApiParam({ name: 'uuid', description: 'Appointment UUID' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Appointment deleted successfully',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' }
      }
    }
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Appointment not found',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Cannot delete completed appointments',
  })
  remove(@Param('uuid') uuid: string): Promise<{ message: string }> {
    return this.appointmentService.remove(uuid);
  }
} 