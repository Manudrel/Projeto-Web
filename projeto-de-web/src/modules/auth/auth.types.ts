import type { UserRole, UserStatus } from '../users/user.entity.js';

export interface AuthenticatedUser {
  id: number;
  name: string;
  email: string;
  status: UserStatus;
  profile: {
    id: number;
    name: string;
    role: UserRole;
  };
  permissions: string[];
}

export interface AuthAccount extends AuthenticatedUser {
  passwordHash: string;
}

export interface AccessTokenPayload {
  sub: number;
  email: string;
  profileId: number;
  role: UserRole;
  permissions: string[];
}

export interface RefreshTokenPayload {
  sub: number;
  typ: 'refresh';
  jti: string;
}
