export enum statusEnrollment {
  ACTIVE = 'ACTIVE',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}


export interface Enrollment {
  id: number;
  userId: number;
  courseId: number;
  status: statusEnrollment;
  progress: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
