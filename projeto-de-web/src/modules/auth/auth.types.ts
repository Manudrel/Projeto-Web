export type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

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

export interface AuthUserJoinRow {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  status: UserStatus;
  profile_id: number;
  profile_name: string;
  role: UserRole;
  profile_status: UserStatus;
  permission_name: string | null;
}

export interface AuthUserRow {
  id: number;
  name: string;
  email: string;
  status: UserStatus;
  profile_id: number;
  profile_name: string;
  role: UserRole;
}
