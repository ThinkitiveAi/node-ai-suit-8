import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { PasswordUtil } from '../common/utils/password.util';
import { UserRole } from '../common/decorators/roles.decorator';
import { LoginDto, RegisterPatientDto, RegisterProviderDto } from './dto';

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async registerPatient(dto: RegisterPatientDto): Promise<AuthResponse> {
    // Validate password strength
    const passwordValidation = PasswordUtil.validatePasswordStrength(dto.password);
    if (!passwordValidation.isValid) {
      throw new BadRequestException({
        message: passwordValidation.errors,
        error: 'Password validation failed',
      });
    }

    // Check if user already exists
    const existingUser = await this.prisma.patient.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { phoneNumber: dto.phoneNumber },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === dto.email) {
        throw new ConflictException('Email already registered');
      }
      if (existingUser.phoneNumber === dto.phoneNumber) {
        throw new ConflictException('Phone number already registered');
      }
    }

    // Hash password
    const passwordHash = await PasswordUtil.hashPassword(dto.password);

    // Create patient
    const patient = await this.prisma.patient.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        passwordHash,
        dateOfBirth: new Date(dto.dateOfBirth),
        gender: dto.gender,
        street: dto.address?.street,
        city: dto.address?.city,
        state: dto.address?.state,
        zip: dto.address?.zip,
      },
    });

    return this.generateAuthResponse(patient.id.toString(), patient.email, UserRole.PATIENT, {
      id: patient.id.toString(),
      firstName: patient.firstName,
      lastName: patient.lastName,
    });
  }

  async registerProvider(dto: RegisterProviderDto): Promise<AuthResponse> {
    // Validate password strength
    const passwordValidation = PasswordUtil.validatePasswordStrength(dto.password);
    if (!passwordValidation.isValid) {
      throw new BadRequestException({
        message: passwordValidation.errors,
        error: 'Password validation failed',
      });
    }

    // Check if provider already exists
    const existingProvider = await this.prisma.provider.findFirst({
      where: {
        OR: [
          { email: dto.email },
          { phoneNumber: dto.phoneNumber },
          { licenseNumber: dto.licenseNumber },
        ],
      },
    });

    if (existingProvider) {
      if (existingProvider.email === dto.email) {
        throw new ConflictException('Email already registered');
      }
      if (existingProvider.phoneNumber === dto.phoneNumber) {
        throw new ConflictException('Phone number already registered');
      }
      if (existingProvider.licenseNumber === dto.licenseNumber) {
        throw new ConflictException('License number already registered');
      }
    }

    // Hash password
    const passwordHash = await PasswordUtil.hashPassword(dto.password);

    // Create provider
    const provider = await this.prisma.provider.create({
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        email: dto.email,
        phoneNumber: dto.phoneNumber,
        passwordHash,
        specialization: dto.specialization,
        licenseNumber: dto.licenseNumber,
        yearsOfExperience: dto.yearsOfExperience || 0,
        clinicStreet: dto.clinicAddress?.street,
        clinicCity: dto.clinicAddress?.city,
        clinicState: dto.clinicAddress?.state,
        clinicZip: dto.clinicAddress?.zip,
      },
    });

    return this.generateAuthResponse(provider.id.toString(), provider.email, UserRole.PROVIDER, {
      id: provider.id.toString(),
      firstName: provider.firstName,
      lastName: provider.lastName,
    });
  }

  async loginPatient(dto: LoginDto): Promise<AuthResponse> {
    const patient = await this.prisma.patient.findFirst({
      where: {
        OR: [
          { email: dto.emailOrPhone },
          { phoneNumber: dto.emailOrPhone },
        ],
      },
    });

    if (!patient) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await PasswordUtil.comparePassword(
      dto.password,
      patient.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateAuthResponse(patient.id.toString(), patient.email, UserRole.PATIENT, {
      id: patient.id.toString(),
      firstName: patient.firstName,
      lastName: patient.lastName,
    });
  }

  async loginProvider(dto: LoginDto): Promise<AuthResponse> {
    
    const provider = await this.prisma.provider.findFirst({
      where: {
        OR: [
          { email: dto.emailOrPhone },
          { phoneNumber: dto.emailOrPhone },
        ],
      },
    });

    if (!provider) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await PasswordUtil.comparePassword(
      dto.password,
      provider.passwordHash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.generateAuthResponse(provider.id.toString(), provider.email, UserRole.PROVIDER, {
      id: provider.id.toString(),
      firstName: provider.firstName,
      lastName: provider.lastName,
    });
  }

  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      // Check if refresh token exists in database
      const storedToken = await this.prisma.refreshToken.findUnique({
        where: { token: refreshToken },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      // Generate new access token
      const accessToken = this.jwtService.sign(
        {
          sub: payload.sub,
          email: payload.email,
          role: payload.role,
        },
        {
          secret: this.configService.get('jwt.secret'),
          expiresIn: this.configService.get('jwt.expiresIn'),
        },
      );

      return { accessToken };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    await this.prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });
  }

  private async generateAuthResponse(
    userId: string,
    email: string,
    role: UserRole,
    userInfo: { id: string; firstName: string; lastName: string },
  ): Promise<AuthResponse> {
    const payload: JwtPayload = {
      sub: userId,
      email,
      role,
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.secret'),
      expiresIn: this.configService.get('jwt.expiresIn'),
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('jwt.refreshSecret'),
      expiresIn: this.configService.get('jwt.refreshExpiresIn'),
    });

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        expiresAt,
        patientId: role === UserRole.PATIENT ? parseInt(userId, 10) : null,
        providerId: role === UserRole.PROVIDER ? parseInt(userId, 10) : null,
      },
    });

    return {
      user: {
        id: userInfo.id,
        email,
        firstName: userInfo.firstName,
        lastName: userInfo.lastName,
        role,
      },
      tokens: {
        accessToken,
        refreshToken,
      },
    };
  }
} 