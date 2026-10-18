export enum PermissionResource {
  USERS = 'USERS',
  PROFILES = 'PROFILES',
  PERMISSIONS = 'PERMISSIONS',
  CATEGORIES = 'CATEGORIES',
  COURSES = 'COURSES',
  MODULES = 'MODULES',
  LESSONS = 'LESSONS',
  ENROLLMENTS = 'ENROLLMENTS',
  PROGRESS = 'PROGRESS',
  ASSESSMENTS = 'ASSESSMENTS',
  CERTIFICATES = 'CERTIFICATES',
}

export interface Permission {
  id: number;
  name: string;
  resource: PermissionResource;
  description: string;
  createdAt: Date;
}

