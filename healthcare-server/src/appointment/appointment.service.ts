import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto, UpdateAppointmentDto, AppointmentResponseDto } from './dto';
import { Appointment, AppointmentStatus, AppointmentMode } from '@prisma/client';

@Injectable()
export class AppointmentService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createAppointmentDto: CreateAppointmentDto): Promise<AppointmentResponseDto> {
    const { patientId, providerId, scheduledDate, ...appointmentData } = createAppointmentDto;

    // Validate that patient exists
    const patient = await this.prisma.patient.findUnique({
      where: { uuid: patientId }
    });
    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    // Validate that provider exists
    const provider = await this.prisma.provider.findUnique({
      where: { uuid: providerId }
    });
    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    // Check for scheduling conflicts
    const conflictingAppointment = await this.prisma.appointment.findFirst({
      where: {
        providerId: provider.id,
        scheduledDate: new Date(scheduledDate),
        status: {
          in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED]
        }
      }
    });

    if (conflictingAppointment) {
      throw new ConflictException('Provider has a conflicting appointment at this time');
    }

    // Check if the scheduled time is in the past
    if (new Date(scheduledDate) < new Date()) {
      throw new BadRequestException('Cannot schedule appointments in the past');
    }

    const appointment = await this.prisma.appointment.create({
      data: {
        ...appointmentData,
        patientId: patient.id,
        providerId: provider.id,
        scheduledDate: new Date(scheduledDate),
        estimatedAmount: appointmentData.estimatedAmount,
      },
      include: {
        patient: true,
        provider: true,
      }
    });

    return this.mapToResponseDto(appointment);
  }

  async findAll(
    page: number = 1,
    limit: number = 10,
    patientId?: string,
    providerId?: string,
    status?: AppointmentStatus
  ): Promise<{ appointments: AppointmentResponseDto[]; total: number; page: number; limit: number }> {
    const skip = (page - 1) * limit;
    
    const where: any = {};
    
    if (patientId) {
      const patient = await this.prisma.patient.findUnique({ where: { uuid: patientId } });
      if (patient) {
        where.patientId = patient.id;
      }
    }
    
    if (providerId) {
      const provider = await this.prisma.provider.findUnique({ where: { uuid: providerId } });
      if (provider) {
        where.providerId = provider.id;
      }
    }
    
    if (status) {
      where.status = status;
    }

    const [appointments, total] = await Promise.all([
      this.prisma.appointment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { scheduledDate: 'desc' },
        include: {
          patient: true,
          provider: true,
        }
      }),
      this.prisma.appointment.count({ where })
    ]);

    return {
      appointments: appointments.map(appointment => this.mapToResponseDto(appointment)),
      total,
      page,
      limit
    };
  }

  async findOne(uuid: string): Promise<AppointmentResponseDto> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { uuid },
      include: {
        patient: true,
        provider: true,
      }
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    return this.mapToResponseDto(appointment);
  }

  async update(uuid: string, updateAppointmentDto: UpdateAppointmentDto): Promise<AppointmentResponseDto> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { uuid }
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Prevent updates to completed or cancelled appointments
    if (appointment.status === AppointmentStatus.COMPLETED || 
        appointment.status === AppointmentStatus.CANCELLED) {
      throw new BadRequestException('Cannot update completed or cancelled appointments');
    }

    const { patientId, providerId, scheduledDate, ...updateData } = updateAppointmentDto;
    const updatePayload: any = { ...updateData };

    if (patientId) {
      const patient = await this.prisma.patient.findUnique({ where: { uuid: patientId } });
      if (!patient) {
        throw new NotFoundException('Patient not found');
      }
      updatePayload.patientId = patient.id;
    }

    if (providerId) {
      const provider = await this.prisma.provider.findUnique({ where: { uuid: providerId } });
      if (!provider) {
        throw new NotFoundException('Provider not found');
      }
      updatePayload.providerId = provider.id;
    }

    if (scheduledDate) {
      if (new Date(scheduledDate) < new Date()) {
        throw new BadRequestException('Cannot schedule appointments in the past');
      }
      updatePayload.scheduledDate = new Date(scheduledDate);
    }

    const updatedAppointment = await this.prisma.appointment.update({
      where: { uuid },
      data: updatePayload,
      include: {
        patient: true,
        provider: true,
      }
    });

    return this.mapToResponseDto(updatedAppointment);
  }

  async remove(uuid: string): Promise<{ message: string }> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { uuid }
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    // Prevent deletion of completed appointments
    if (appointment.status === AppointmentStatus.COMPLETED) {
      throw new BadRequestException('Cannot delete completed appointments');
    }

    await this.prisma.appointment.delete({
      where: { uuid }
    });

    return { message: 'Appointment deleted successfully' };
  }

  async updateStatus(uuid: string, status: AppointmentStatus): Promise<AppointmentResponseDto> {
    const appointment = await this.prisma.appointment.findUnique({
      where: { uuid }
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    const updatedAppointment = await this.prisma.appointment.update({
      where: { uuid },
      data: { status },
      include: {
        patient: true,
        provider: true,
      }
    });

    return this.mapToResponseDto(updatedAppointment);
  }

  private mapToResponseDto(appointment: Appointment & { patient: any; provider: any }): AppointmentResponseDto {
    return {
      uuid: appointment.uuid,
      patientId: appointment.patient.uuid,
      providerId: appointment.provider.uuid,
      appointmentType: appointment.appointmentType,
      appointmentMode: appointment.appointmentMode,
      scheduledDate: appointment.scheduledDate,
      estimatedAmount: Number(appointment.estimatedAmount),
      reasonForVisit: appointment.reasonForVisit,
      status: appointment.status,
      notes: appointment.notes,
      createdAt: appointment.createdAt,
      updatedAt: appointment.updatedAt,
    };
  }
} 