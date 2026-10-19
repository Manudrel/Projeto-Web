import type { UserStatus } from '../auth/auth.types.js';

export interface User {
  id: number;
  name: string;
  email: string;
  passwordHash: string;
  status: UserStatus;
  profileId: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
