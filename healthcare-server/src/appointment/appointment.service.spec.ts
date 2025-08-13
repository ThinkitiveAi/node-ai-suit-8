import { Test, TestingModule } from '@nestjs/testing';
import { AppointmentService } from './appointment.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto, AppointmentMode } from './dto';
import { NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';

describe('AppointmentService', () => {
  let service: AppointmentService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    patient: {
      findUnique: jest.fn(),
    },
    provider: {
      findUnique: jest.fn(),
    },
    appointment: {
      create: jest.fn(),
      findMany: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppointmentService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AppointmentService>(AppointmentService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createAppointmentDto: CreateAppointmentDto = {
      patientId: '123e4567-e89b-12d3-a456-426614174000',
      providerId: '123e4567-e89b-12d3-a456-426614174001',
      appointmentType: 'General Checkup',
      appointmentMode: AppointmentMode.IN_PERSON,
      scheduledDate: '2025-01-15T10:00:00Z',
      estimatedAmount: 150.00,
      reasonForVisit: 'Annual checkup',
    };

    const mockPatient = {
      id: 1,
      uuid: '123e4567-e89b-12d3-a456-426614174000',
    };

    const mockProvider = {
      id: 1,
      uuid: '123e4567-e89b-12d3-a456-426614174001',
    };

    const mockAppointment = {
      uuid: '123e4567-e89b-12d3-a456-426614174002',
      patientId: 1,
      providerId: 1,
      appointmentType: 'General Checkup',
      appointmentMode: 'IN_PERSON',
      scheduledDate: new Date('2024-01-15T10:00:00Z'),
      estimatedAmount: 150.00,
      reasonForVisit: 'Annual checkup',
      status: 'SCHEDULED',
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      patient: mockPatient,
      provider: mockProvider,
    };

    it('should create an appointment successfully', async () => {
      mockPrismaService.patient.findUnique.mockResolvedValue(mockPatient);
      mockPrismaService.provider.findUnique.mockResolvedValue(mockProvider);
      mockPrismaService.appointment.findFirst.mockResolvedValue(null);
      mockPrismaService.appointment.create.mockResolvedValue(mockAppointment);

      const result = await service.create(createAppointmentDto);

      expect(result).toBeDefined();
      expect(result.uuid).toBe(mockAppointment.uuid);
      expect(result.appointmentType).toBe(mockAppointment.appointmentType);
    });

    it('should throw NotFoundException when patient not found', async () => {
      mockPrismaService.patient.findUnique.mockResolvedValue(null);

      await expect(service.create(createAppointmentDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException when provider not found', async () => {
      mockPrismaService.patient.findUnique.mockResolvedValue(mockPatient);
      mockPrismaService.provider.findUnique.mockResolvedValue(null);

      await expect(service.create(createAppointmentDto)).rejects.toThrow(NotFoundException);
    });

    it('should throw ConflictException when there is a scheduling conflict', async () => {
      mockPrismaService.patient.findUnique.mockResolvedValue(mockPatient);
      mockPrismaService.provider.findUnique.mockResolvedValue(mockProvider);
      mockPrismaService.appointment.findFirst.mockResolvedValue({ id: 1 });

      await expect(service.create(createAppointmentDto)).rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException when scheduling in the past', async () => {
      const pastDateDto = {
        ...createAppointmentDto,
        scheduledDate: '2020-01-15T10:00:00Z',
      };

      mockPrismaService.patient.findUnique.mockResolvedValue(mockPatient);
      mockPrismaService.provider.findUnique.mockResolvedValue(mockProvider);
      mockPrismaService.appointment.findFirst.mockResolvedValue(null);

      await expect(service.create(pastDateDto)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return paginated appointments', async () => {
      const mockAppointments = [
        {
          uuid: '123e4567-e89b-12d3-a456-426614174002',
          patientId: 1,
          providerId: 1,
          appointmentType: 'General Checkup',
          appointmentMode: 'IN_PERSON',
          scheduledDate: new Date(),
          estimatedAmount: 150.00,
          reasonForVisit: 'Annual checkup',
          status: 'SCHEDULED',
          notes: null,
          createdAt: new Date(),
          updatedAt: new Date(),
          patient: { uuid: '123e4567-e89b-12d3-a456-426614174000' },
          provider: { uuid: '123e4567-e89b-12d3-a456-426614174001' },
        },
      ];

      mockPrismaService.appointment.findMany.mockResolvedValue(mockAppointments);
      mockPrismaService.appointment.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(result.appointments).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });
  });

  describe('findOne', () => {
    it('should return an appointment by UUID', async () => {
      const mockAppointment = {
        uuid: '123e4567-e89b-12d3-a456-426614174002',
        patientId: 1,
        providerId: 1,
        appointmentType: 'General Checkup',
        appointmentMode: 'IN_PERSON',
        scheduledDate: new Date(),
        estimatedAmount: 150.00,
        reasonForVisit: 'Annual checkup',
        status: 'SCHEDULED',
        notes: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        patient: { uuid: '123e4567-e89b-12d3-a456-426614174000' },
        provider: { uuid: '123e4567-e89b-12d3-a456-426614174001' },
      };

      mockPrismaService.appointment.findUnique.mockResolvedValue(mockAppointment);

      const result = await service.findOne('123e4567-e89b-12d3-a456-426614174002');

      expect(result.uuid).toBe(mockAppointment.uuid);
    });

    it('should throw NotFoundException when appointment not found', async () => {
      mockPrismaService.appointment.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-uuid')).rejects.toThrow(NotFoundException);
    });
  });
}); 