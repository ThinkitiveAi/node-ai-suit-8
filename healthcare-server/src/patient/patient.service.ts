import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdatePatientDto } from './dto/update-patient.dto';

@Injectable()
export class PatientService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: parseInt(id, 10) },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        dateOfBirth: true,
        gender: true,
        street: true,
        city: true,
        state: true,
        zip: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    return {
      ...patient,
      address: {
        street: patient.street,
        city: patient.city,
        state: patient.state,
        zip: patient.zip,
      },
    };
  }

  async update(id: string, dto: UpdatePatientDto) {
    const patient = await this.prisma.patient.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!patient) {
      throw new NotFoundException('Patient not found');
    }

    const updatedPatient = await this.prisma.patient.update({
      where: { id: parseInt(id, 10) },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phoneNumber: dto.phoneNumber,
        street: dto.address?.street,
        city: dto.address?.city,
        state: dto.address?.state,
        zip: dto.address?.zip,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        dateOfBirth: true,
        gender: true,
        street: true,
        city: true,
        state: true,
        zip: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      ...updatedPatient,
      address: {
        street: updatedPatient.street,
        city: updatedPatient.city,
        state: updatedPatient.state,
        zip: updatedPatient.zip,
      },
    };
  }
} 