export interface Progress {
  id: number;
  enrollmentId: number;
  lessonId: number;
  completed: boolean;
  completedAt: Date | null;
  createdAt: Date;
}
