import { SetMetadata } from '@nestjs/common';

export enum UserRole {
  PATIENT = 'patient',
  PROVIDER = 'provider',
}

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles); 