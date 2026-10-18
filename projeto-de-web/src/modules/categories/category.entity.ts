export enum CategoryStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface Category {
  id: number;
  name: string;
  description: string;
  status: CategoryStatus;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
