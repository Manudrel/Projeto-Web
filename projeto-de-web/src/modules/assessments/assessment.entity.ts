export enum AssessmentType {
  MODULE = 'MODULE',
  FINAL = 'FINAL',
}

export interface Assessment {
  id: number;
  courseId: number;
  moduleId: number | null;
  title: string;
  type: AssessmentType;
  minScoreToPass: number;
  maxAttempts: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface AssessmentAttempt {
  id: number;
  enrollmentId: number;
  assessmentId: number;
  score: number;
  isApproved: boolean;
  attemptNumber: number;
  createdAt: Date;
}
