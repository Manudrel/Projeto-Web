export enum TypeLesson {
  VIDEO = 'VIDEO',
  ARTICLE = 'ARTICLE',
  QUIZ = 'QUIZ',

}

export interface Lesson {
  id: number;
  moduleId: number;
  order: number;
  title: string;
  content: string;
  type: TypeLesson;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
