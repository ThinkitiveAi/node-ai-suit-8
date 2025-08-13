import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AvailabilityEnhancedController } from './availability-enhanced.controller';
import { AvailabilityEnhancedService } from './availability-enhanced.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { UserRole } from '../common/decorators/roles.decorator';
import {
  CreateComprehensiveAvailabilityDto,
  CreateProviderSettingsDto,
  CreateBlockDayDto,
} from './dto';

describe('AvailabilityEnhancedController (Integration)', () => {
  let app: INestApplication;
  let availabilityEnhancedService: AvailabilityEnhancedService;

  const mockAvailabilityEnhancedService = {
    createComprehensiveAvailability: jest.fn(),
    getProviderSettings: jest.fn(),
    upsertProviderSettings: jest.fn(),
    getProviderBlockDays: jest.fn(),
    createBlockDay: jest.fn(),
    createBulkBlockDays: jest.fn(),
  };

  const mockJwtAuthGuard = {
    canActivate: jest.fn(() => true),
  };

  const mockRolesGuard = {
    canActivate: jest.fn(() => true),
  };

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [AvailabilityEnhancedController],
      providers: [
        {
          provide: AvailabilityEnhancedService,
          useValue: mockAvailabilityEnhancedService,
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
    
    availabilityEnhancedService = moduleFixture.get<AvailabilityEnhancedService>(AvailabilityEnhancedService);
    
    // Mock the request user
    app.use((req, res, next) => {
      req.user = {
        id: 'provider-123',
        email: 'provider@test.com',
        role: UserRole.PROVIDER,
      };
      next();
    });

    await app.init();
  });

  afterEach(async () => {
    await app.close();
    jest.clearAllMocks();
  });

  describe('GET /api/v1/provider/settings/availability', () => {
    const mockSettings = {
      id: 1,
      providerId: 123,
      workingHours: {
        startTime: '09:00',
        endTime: '17:00',
      },
      breakTime: {
        startTime: '12:00',
        endTime: '13:00',
      },
      maxAppointmentsPerSlot: 1,
      advanceBookingDays: 30,
      timezone: 'UTC',
    };

    it('should get provider settings successfully', async () => {
      mockAvailabilityEnhancedService.getProviderSettings.mockResolvedValue(mockSettings);

      const response = await request(app.getHttpServer())
        .get('/api/v1/provider/settings/availability')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Provider settings retrieved successfully');
      expect(response.body.data).toEqual(mockSettings);
      expect(mockAvailabilityEnhancedService.getProviderSettings).toHaveBeenCalledWith('provider-123');
    });
  });

  describe('GET /api/v1/provider/block-days', () => {
    const mockBlockDays = [
      {
        id: 1,
        providerId: 123,
        date: '2024-12-25',
        reason: 'Christmas Holiday',
        isRecurring: true,
        createdAt: '2025-07-31T09:58:26.875Z',
        updatedAt: '2025-07-31T09:58:26.875Z',
      },
    ];

    it('should get provider block days successfully', async () => {
      mockAvailabilityEnhancedService.getProviderBlockDays.mockResolvedValue(mockBlockDays);

      const response = await request(app.getHttpServer())
        .get('/api/v1/provider/block-days')
        .query({ startDate: '2024-12-01', endDate: '2024-12-31' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Block days retrieved successfully');
      expect(response.body.data).toEqual(mockBlockDays);
      expect(mockAvailabilityEnhancedService.getProviderBlockDays).toHaveBeenCalledWith(
        'provider-123',
        '2024-12-01',
        '2024-12-31',
      );
    });

    it('should get provider block days without date filters', async () => {
      mockAvailabilityEnhancedService.getProviderBlockDays.mockResolvedValue(mockBlockDays);

      const response = await request(app.getHttpServer())
        .get('/api/v1/provider/block-days')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(mockAvailabilityEnhancedService.getProviderBlockDays).toHaveBeenCalledWith(
        'provider-123',
        undefined,
        undefined,
      );
    });
  });
}); 