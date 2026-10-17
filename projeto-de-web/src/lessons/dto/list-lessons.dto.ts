import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { TypeLesson } from '../lessons.entity.js';

export class ListLessonsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  moduleId?: number;

  @IsOptional()
  @IsEnum(TypeLesson)
  type?: TypeLesson;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;
}