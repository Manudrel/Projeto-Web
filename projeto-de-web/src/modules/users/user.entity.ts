export type UserRole = 'ADMIN' | 'INSTRUCTOR' | 'STUDENT';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface User {
  id: number;
  name: string;
  email: string;
  status: UserStatus;
  profile: { id: number; name: string; role: UserRole };
  createdAt: Date;
  updatedAt: Date;
}
