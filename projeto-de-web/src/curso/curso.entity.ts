export enum NivelCurso {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
}

export interface Curso {
  id: number;
  title: string;
  description: string;
  categoryId: number;
  instructorId: number;
  level: NivelCurso;
  workloadHours: number;
  isPublished: boolean;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}
