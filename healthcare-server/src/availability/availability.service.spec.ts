import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException, ForbiddenException } from '@nestjs/common';
import { AvailabilityService } from './availability.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAvailabilityDto } from './dto';
import { AvailabilityStatus, RecurrencePattern } from '@prisma/client';

describe('AvailabilityService', () => {
  let service: AvailabilityService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    providerAvailability: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    provider: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AvailabilityService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<AvailabilityService>(AvailabilityService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createAvailability', () => {
    const providerId = '123'; // Changed to number string
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7); // 7 days from now
    const futureDateString = futureDate.toISOString().split('T')[0];
    
    const validDto: CreateAvailabilityDto = {
      date: futureDateString,
      startTime: '09:00',
      endTime: '17:00',
      slotDuration: 30,
      maxAppointments: 1,
      timezone: 'UTC',
      isRecurring: false,
      notes: undefined,
      recurrencePattern: undefined,
      recurrenceEndDate: undefined,
    };

    const mockProvider = {
      id: 123,
      firstName: 'Dr. John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      specialization: 'Cardiology',
    };

    const mockAvailability = {
      id: 456,
      providerId: 123,
      date: futureDate,
      startTime: '09:00',
      endTime: '17:00',
      isRecurring: false,
      recurrencePattern: null,
      recurrenceEndDate: null,
      slotDuration: 30,
      status: AvailabilityStatus.AVAILABLE,
      maxAppointments: 1,
      currentAppointments: 0,
      notes: null,
      timezone: 'UTC',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create availability successfully', async () => {
      mockPrismaService.provider.findUnique.mockResolvedValue(mockProvider);
      mockPrismaService.providerAvailability.findFirst.mockResolvedValue(null);
      mockPrismaService.providerAvailability.create.mockResolvedValue(mockAvailability);

      const result = await service.createAvailability(providerId, validDto);

      expect(result).toBeDefined();
      expect(result.id).toBe(mockAvailability.id);
      expect(result.providerId).toBe(mockProvider.id);
      expect(result.date).toBe(futureDateString);
      expect(mockPrismaService.providerAvailability.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          providerId: 123,
          date: expect.any(Date),
          startTime: '09:00',
          endTime: '17:00',
          isRecurring: false,
          slotDuration: 30,
          maxAppointments: 1,
          notes: undefined,
          timezone: 'UTC',
        }),
      });
    });

    it('should throw NotFoundException when provider does not exist', async () => {
      mockPrismaService.provider.findUnique.mockResolvedValue(null);

      await expect(service.createAvailability(providerId, validDto))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw BadRequestException for invalid time range', async () => {
      const invalidDto = { ...validDto, startTime: '17:00', endTime: '09:00' };
      mockPrismaService.provider.findUnique.mockResolvedValue(mockProvider);

      await expect(service.createAvailability(providerId, invalidDto))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for past date', async () => {
      const pastDto = { ...validDto, date: '2020-01-01' };
      mockPrismaService.provider.findUnique.mockResolvedValue(mockProvider);

      await expect(service.createAvailability(providerId, pastDto))
        .rejects.toThrow(BadRequestException);
    });

    it('should throw ConflictException for overlapping slots', async () => {
      const overlappingSlot = {
        id: 789,
        startTime: '08:00',
        endTime: '12:00',
      };

      mockPrismaService.provider.findUnique.mockResolvedValue(mockProvider);
      mockPrismaService.providerAvailability.findFirst.mockResolvedValue(overlappingSlot);

      await expect(service.createAvailability(providerId, validDto))
        .rejects.toThrow(ConflictException);
    });

    it('should throw BadRequestException for slot duration less than 15 minutes', async () => {
      const shortDto = { ...validDto, startTime: '09:00', endTime: '09:10' };
      mockPrismaService.provider.findUnique.mockResolvedValue(mockProvider);

      await expect(service.createAvailability(providerId, shortDto))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('updateAvailability', () => {
    const slotId = '456';
    const providerId = '123';
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    
    const existingSlot = {
      id: 456,
      providerId: 123,
      date: futureDate,
      startTime: '09:00',
      endTime: '17:00',
      currentAppointments: 0,
    };

    it('should update availability successfully', async () => {
      const updateDto = { startTime: '10:00' };
      const updatedSlot = { ...existingSlot, startTime: '10:00' };

      mockPrismaService.providerAvailability.findUnique.mockResolvedValue(existingSlot);
      mockPrismaService.providerAvailability.findFirst.mockResolvedValue(null);
      mockPrismaService.providerAvailability.update.mockResolvedValue(updatedSlot);

      const result = await service.updateAvailability(slotId, providerId, updateDto);

      expect(result.startTime).toBe('10:00');
      expect(mockPrismaService.providerAvailability.update).toHaveBeenCalledWith({
        where: { id: 456 },
        data: expect.objectContaining({ startTime: '10:00' }),
      });
    });

    it('should throw NotFoundException when slot does not exist', async () => {
      mockPrismaService.providerAvailability.findUnique.mockResolvedValue(null);

      await expect(service.updateAvailability(slotId, providerId, {}))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when updating another provider\'s slot', async () => {
      const otherProviderSlot = { ...existingSlot, providerId: 999 };
      mockPrismaService.providerAvailability.findUnique.mockResolvedValue(otherProviderSlot);

      await expect(service.updateAvailability(slotId, providerId, {}))
        .rejects.toThrow(ForbiddenException);
    });
  });

  describe('deleteAvailability', () => {
    const slotId = '456';
    const providerId = '123';

    it('should delete availability successfully', async () => {
      const existingSlot = {
        id: 456,
        providerId: 123,
        currentAppointments: 0,
      };

      mockPrismaService.providerAvailability.findUnique.mockResolvedValue(existingSlot);
      mockPrismaService.providerAvailability.delete.mockResolvedValue(existingSlot);

      await service.deleteAvailability(slotId, providerId);

      expect(mockPrismaService.providerAvailability.delete).toHaveBeenCalledWith({
        where: { id: 456 },
      });
    });

    it('should throw NotFoundException when slot does not exist', async () => {
      mockPrismaService.providerAvailability.findUnique.mockResolvedValue(null);

      await expect(service.deleteAvailability(slotId, providerId))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException when deleting another provider\'s slot', async () => {
      const otherProviderSlot = {
        id: 456,
        providerId: 999,
        currentAppointments: 0,
      };

      mockPrismaService.providerAvailability.findUnique.mockResolvedValue(otherProviderSlot);

      await expect(service.deleteAvailability(slotId, providerId))
        .rejects.toThrow(ForbiddenException);
    });

    it('should throw BadRequestException when deleting slot with appointments', async () => {
      const slotWithAppointments = {
        id: 456,
        providerId: 123,
        currentAppointments: 2,
      };

      mockPrismaService.providerAvailability.findUnique.mockResolvedValue(slotWithAppointments);

      await expect(service.deleteAvailability(slotId, providerId))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('searchAvailability', () => {
    it('should search availability with filters', async () => {
      const searchDto = {
        date: '2024-12-01',
        specialization: 'Cardiology',
        page: 1,
        limit: 20,
        status: AvailabilityStatus.AVAILABLE,
        timezone: 'UTC',
      };

      const mockResults = [
        {
          id: 1,
          providerId: 1,
          date: new Date('2024-12-01'),
          startTime: '09:00',
          endTime: '10:00',
          slotDuration: 30,
          status: AvailabilityStatus.AVAILABLE,
          provider: {
            id: 1,
            firstName: 'Dr. John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            specialization: 'Cardiology',
            yearsOfExperience: 10,
            clinicCity: 'New York',
            clinicState: 'NY',
          },
        },
      ];

      mockPrismaService.providerAvailability.findMany.mockResolvedValue(mockResults);
      mockPrismaService.providerAvailability.count.mockResolvedValue(1);

      const result = await service.searchAvailability(searchDto);

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.data[0].provider).toBeDefined();
    });

    it('should apply date range filters', async () => {
      const searchDto = {
        startDate: '2024-12-01',
        endDate: '2024-12-31',
        page: 1,
        limit: 20,
        status: AvailabilityStatus.AVAILABLE,
        timezone: 'UTC',
      };

      mockPrismaService.providerAvailability.findMany.mockResolvedValue([]);
      mockPrismaService.providerAvailability.count.mockResolvedValue(0);

      await service.searchAvailability(searchDto);

      expect(mockPrismaService.providerAvailability.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            date: {
              gte: new Date('2024-12-01'),
              lte: new Date('2024-12-31'),
            },
          }),
        }),
      );
    });
  });

  describe('getProviderAvailability', () => {
    it('should get provider availability with pagination', async () => {
      const providerId = '123';
      const query = { 
        page: 1, 
        limit: 10,
        status: AvailabilityStatus.AVAILABLE,
        timezone: 'UTC',
      };

      mockPrismaService.providerAvailability.findMany.mockResolvedValue([]);
      mockPrismaService.providerAvailability.count.mockResolvedValue(5);

      const result = await service.getProviderAvailability(providerId, query);

      expect(result.total).toBe(5);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
      expect(mockPrismaService.providerAvailability.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            providerId: '123',
            status: AvailabilityStatus.AVAILABLE,
          }),
          skip: 0,
          take: 10,
          orderBy: [
            { date: 'asc' },
            { startTime: 'asc' },
          ],
        }),
      );
    });
  });
}); 