import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { TypeLesson } from '../lessons.entity.js';

export class CreateLessonDto {
  @IsInt()
  moduleId!: number;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsNotEmpty()
  content!: string;

  @IsEnum(TypeLesson)
  type!: TypeLesson;
}