export enum ProfileRole {
  ADMIN = 'ADMIN',
  INSTRUCTOR = 'INSTRUCTOR',
  STUDENT = 'STUDENT',
}

export enum ProfileStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface Profile {
  id: number;
  name: string;
  role: ProfileRole;
  description: string;
  status: ProfileStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface ProfileWithPermissions extends Profile {
  permissions: string[];
}
