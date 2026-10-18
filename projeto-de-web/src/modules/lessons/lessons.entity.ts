export enum TypeLesson {
  VIDEO = 'VIDEO',
  ARTICLE = 'ARTICLE',
  QUIZ = 'QUIZ',

}

export interface Lesson {
  id: number;
  moduleId: string;
  title: string;
  content: string;
  type: TypeLesson;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
