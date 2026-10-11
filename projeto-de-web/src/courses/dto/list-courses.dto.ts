import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { CourseLevel } from '../course.entity.js';

export class ListCoursesDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A página deve ser um número inteiro' })
  @Min(1, { message: 'A página deve ser maior que zero' })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O limite deve ser um número inteiro' })
  @Min(1, { message: 'O limite deve ser maior que zero' })
  limit: number = 20;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O categoryId deve ser um número inteiro' })
  categoryId?: number;

  @IsOptional()
  @IsEnum(CourseLevel, {
    message: 'O nível deve ser BEGINNER, INTERMEDIATE ou ADVANCED',
  })
  level?: CourseLevel;
}
