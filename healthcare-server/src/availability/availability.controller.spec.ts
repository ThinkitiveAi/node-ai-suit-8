import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AvailabilityController } from './availability.controller';
import { AvailabilityService } from './availability.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { CreateAvailabilityDto } from './dto';
import { AvailabilityStatus, RecurrencePattern } from '@prisma/client';

describe('AvailabilityController (Integration)', () => {
  let app: INestApplication;
  let availabilityService: AvailabilityService;

  const mockAvailabilityService = {
    createAvailability: jest.fn(),
    createBulkAvailability: jest.fn(),
    getProviderAvailability: jest.fn(),
    searchAvailability: jest.fn(),
    updateAvailability: jest.fn(),
    deleteAvailability: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockRolesGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AvailabilityController],
      providers: [
        {
          provide: AvailabilityService,
          useValue: mockAvailabilityService,
        },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue(mockJwtAuthGuard)
      .overrideGuard(RolesGuard)
      .useValue(mockRolesGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    
    // Apply global validation pipe for testing
    app.useGlobalPipes(new (await import('@nestjs/common')).ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }));
    
    availabilityService = moduleFixture.get<AvailabilityService>(AvailabilityService);
    
    // Mock the request user
    app.use((req, res, next) => {
      req.user = {
        userId: 'provider-123',
        email: 'provider@test.com',
        role: 'PROVIDER',
      };
      next();
    });

    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('POST /api/v1/provider/availability', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const futureDateString = futureDate.toISOString().split('T')[0];
    
    const createDto: CreateAvailabilityDto = {
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

    const mockResponse = {
      id: 123,
      providerId: 456,
      date: futureDateString,
      startTime: '09:00',
      endTime: '17:00',
      isRecurring: false,
      slotDuration: 30,
      status: AvailabilityStatus.AVAILABLE,
      maxAppointments: 1,
      currentAppointments: 0,
      timezone: 'UTC',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it('should create availability slot successfully', async () => {
      mockAvailabilityService.createAvailability.mockResolvedValue(mockResponse);

      const response = await request(app.getHttpServer())
        .post('/api/v1/provider/availability')
        .send(createDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(mockResponse.id);
      expect(mockAvailabilityService.createAvailability).toHaveBeenCalledWith(
        'provider-123',
        expect.objectContaining({
          date: futureDateString,
          startTime: '09:00',
          endTime: '17:00',
          slotDuration: 30,
          maxAppointments: 1,
          timezone: 'UTC',
          isRecurring: false,
        }),
      );
    });

    it('should validate required fields', async () => {
      const invalidDto = { ...createDto };
      delete (invalidDto as any).date;

      await request(app.getHttpServer())
        .post('/api/v1/provider/availability')
        .send(invalidDto)
        .expect(400);
    });

    it('should validate time format', async () => {
      const invalidDto = { ...createDto, startTime: '25:00' };

      await request(app.getHttpServer())
        .post('/api/v1/provider/availability')
        .send(invalidDto)
        .expect(400);
    });
  });

  describe('GET /api/v1/provider/:id/availability', () => {
    const mockPaginatedResponse = {
      data: [
        {
          id: 1,
          providerId: 456,
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '10:00',
          status: AvailabilityStatus.AVAILABLE,
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    };

    it('should get provider availability', async () => {
      mockAvailabilityService.getProviderAvailability.mockResolvedValue(mockPaginatedResponse);

      const response = await request(app.getHttpServer())
        .get('/api/v1/provider/provider-123/availability')
        .query({ page: 1, limit: 20 })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.total).toBe(1);
      expect(mockAvailabilityService.getProviderAvailability).toHaveBeenCalledWith(
        'provider-123',
        expect.objectContaining({ 
          page: 1, 
          limit: 20,
          status: AvailabilityStatus.AVAILABLE,
          timezone: 'UTC',
        }),
      );
    });
  });

  describe('GET /api/v1/availability/search', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const futureDateString = futureDate.toISOString().split('T')[0];
    
    const mockSearchResponse = {
      data: [
        {
          id: 1,
          providerId: 456,
          date: futureDateString,
          startTime: '09:00',
          endTime: '10:00',
          status: AvailabilityStatus.AVAILABLE,
          provider: {
            id: 456,
            firstName: 'Dr. John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            specialization: 'Cardiology',
            yearsOfExperience: 10,
            clinicCity: 'New York',
            clinicState: 'NY',
          },
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    };

    it('should search available providers', async () => {
      mockAvailabilityService.searchAvailability.mockResolvedValue(mockSearchResponse);

      const response = await request(app.getHttpServer())
        .get('/api/v1/availability/search')
        .query({
          date: futureDateString,
          specialization: 'Cardiology',
          page: 1,
          limit: 20,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.data[0].provider).toBeDefined();
      expect(mockAvailabilityService.searchAvailability).toHaveBeenCalledWith(
        expect.objectContaining({
          date: futureDateString,
          specialization: 'Cardiology',
          page: 1,
          limit: 20,
          status: AvailabilityStatus.AVAILABLE,
          timezone: 'UTC',
        }),
      );
    });
  });

  describe('PUT /api/v1/provider/availability/:slotId', () => {
    const updateDto = {
      startTime: '10:00',
      status: AvailabilityStatus.AVAILABLE,
      timezone: 'UTC',
    };

    const mockUpdatedResponse = {
      id: 123,
      providerId: 456,
      date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '17:00',
      status: AvailabilityStatus.AVAILABLE,
    };

    it('should update availability slot', async () => {
      mockAvailabilityService.updateAvailability.mockResolvedValue(mockUpdatedResponse);

      const response = await request(app.getHttpServer())
        .put('/api/v1/provider/availability/123')
        .send(updateDto)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.startTime).toBe('10:00');
      expect(mockAvailabilityService.updateAvailability).toHaveBeenCalledWith(
        '123',
        'provider-123',
        expect.objectContaining({
          startTime: '10:00',
          status: AvailabilityStatus.AVAILABLE,
          timezone: 'UTC',
        }),
      );
    });
  });

  describe('DELETE /api/v1/provider/availability/:slotId', () => {
    it('should delete availability slot', async () => {
      mockAvailabilityService.deleteAvailability.mockResolvedValue(undefined);

      await request(app.getHttpServer())
        .delete('/api/v1/provider/availability/123')
        .expect(204);

      expect(mockAvailabilityService.deleteAvailability).toHaveBeenCalledWith(
        '123',
        'provider-123',
      );
    });
  });

  describe('GET /api/v1/provider/availability/my', () => {
    const mockMyAvailability = {
      data: [
        {
          id: 1,
          providerId: 456,
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '17:00',
        },
      ],
      total: 1,
      page: 1,
      limit: 20,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    };

    it('should get authenticated provider availability', async () => {
      mockAvailabilityService.getProviderAvailability.mockResolvedValue(mockMyAvailability);

      const response = await request(app.getHttpServer())
        .get('/api/v1/provider/availability/my')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockAvailabilityService.getProviderAvailability).toHaveBeenCalledWith(
        'provider-123',
        expect.objectContaining({
          page: 1,
          limit: 20,
          status: AvailabilityStatus.AVAILABLE,
          timezone: 'UTC',
        }),
      );
    });
  });

  describe('POST /api/v1/provider/availability/bulk', () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 7);
    const futureDateString = futureDate.toISOString().split('T')[0];
    
    const bulkDto = {
      slots: [
        {
          date: futureDateString,
          startTime: '09:00',
          endTime: '12:00',
          slotDuration: 30,
          maxAppointments: 1,
          timezone: 'UTC',
          isRecurring: false,
          notes: undefined,
          recurrencePattern: undefined,
          recurrenceEndDate: undefined,
        },
        {
          date: new Date(futureDate.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          startTime: '09:00',
          endTime: '12:00',
          slotDuration: 30,
          maxAppointments: 1,
          timezone: 'UTC',
          isRecurring: false,
          notes: undefined,
          recurrencePattern: undefined,
          recurrenceEndDate: undefined,
        },
      ],
    };

    const mockBulkResponse = {
      successful: 2,
      failed: 0,
      results: [],
      errors: [],
    };

    it('should create bulk availability slots', async () => {
      mockAvailabilityService.createBulkAvailability.mockResolvedValue(mockBulkResponse);

      const response = await request(app.getHttpServer())
        .post('/api/v1/provider/availability/bulk')
        .send(bulkDto)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.successful).toBe(2);
      expect(mockAvailabilityService.createBulkAvailability).toHaveBeenCalledWith(
        'provider-123',
        bulkDto,
      );
    });
  });
}); 