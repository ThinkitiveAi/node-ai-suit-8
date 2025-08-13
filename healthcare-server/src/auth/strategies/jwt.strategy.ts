import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service';
import { UserRole } from '../../common/decorators/roles.decorator';

interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload) {
    console.log('JWT Strategy - Received payload:', payload);
    
    const { sub: userId, email, role } = payload;

    // Verify user still exists
    if (role === UserRole.PATIENT) {
      const patient = await this.prisma.patient.findUnique({
        where: { id: parseInt(userId, 10) },
      });
      if (!patient) {
        console.log('JWT Strategy - Patient not found with ID:', userId);
        throw new UnauthorizedException('User not found');
      }
      console.log('JWT Strategy - Patient found:', patient.email);
    } else if (role === UserRole.PROVIDER) {
      const provider = await this.prisma.provider.findUnique({
        where: { id: parseInt(userId, 10) },
      });
      if (!provider) {
        console.log('JWT Strategy - Provider not found with ID:', userId);
        throw new UnauthorizedException('User not found');
      }
      console.log('JWT Strategy - Provider found:', provider.email);
    }

    const user = {
      id: userId,
      email,
      role,
    };
    
    console.log('JWT Strategy - Returning user:', user);
    return user;
  }
} 