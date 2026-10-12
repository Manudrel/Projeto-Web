export enum ModuleStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface CourseModule {
  id: number;
  courseId: number;
  title: string;
  content: string;
  order: number;
  status: ModuleStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
