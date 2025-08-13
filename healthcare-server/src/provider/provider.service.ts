import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProviderDto } from './dto/update-provider.dto';

@Injectable()
export class ProviderService {
  constructor(private prisma: PrismaService) {}

  async findById(id: string) {
    const provider = await this.prisma.provider.findUnique({
      where: { id: parseInt(id, 10) },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        specialization: true,
        licenseNumber: true,
        yearsOfExperience: true,
        clinicStreet: true,
        clinicCity: true,
        clinicState: true,
        clinicZip: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    return {
      ...provider,
      clinicAddress: {
        street: provider.clinicStreet,
        city: provider.clinicCity,
        state: provider.clinicState,
        zip: provider.clinicZip,
      },
    };
  }

  async update(id: string, dto: UpdateProviderDto) {
    const provider = await this.prisma.provider.findUnique({
      where: { id: parseInt(id, 10) },
    });

    if (!provider) {
      throw new NotFoundException('Provider not found');
    }

    const updatedProvider = await this.prisma.provider.update({
      where: { id: parseInt(id, 10) },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        phoneNumber: dto.phoneNumber,
        specialization: dto.specialization,
        yearsOfExperience: dto.yearsOfExperience,
        clinicStreet: dto.clinicAddress?.street,
        clinicCity: dto.clinicAddress?.city,
        clinicState: dto.clinicAddress?.state,
        clinicZip: dto.clinicAddress?.zip,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber: true,
        specialization: true,
        licenseNumber: true,
        yearsOfExperience: true,
        clinicStreet: true,
        clinicCity: true,
        clinicState: true,
        clinicZip: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return {
      ...updatedProvider,
      clinicAddress: {
        street: updatedProvider.clinicStreet,
        city: updatedProvider.clinicCity,
        state: updatedProvider.clinicState,
        zip: updatedProvider.clinicZip,
      },
    };
  }
} 