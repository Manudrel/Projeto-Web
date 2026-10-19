import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { CourseLevel } from '../course.entity.js';

export class ListCoursesDto {
  @ApiPropertyOptional({ description: 'Número da página', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A página deve ser um número inteiro' })
  @Min(1, { message: 'A página deve ser maior que zero' })
  page: number = 1;

  @ApiPropertyOptional({ description: 'Itens por página', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O limite deve ser um número inteiro' })
  @Min(1, { message: 'O limite deve ser maior que zero' })
  limit: number = 20;

  @ApiPropertyOptional({ description: 'Filtra pela categoria', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O categoryId deve ser um número inteiro' })
  categoryId?: number;

  @ApiPropertyOptional({ description: 'Filtra pelo nível', enum: CourseLevel })
  @IsOptional()
  @IsEnum(CourseLevel, {
    message: 'O nível deve ser BEGINNER, INTERMEDIATE ou ADVANCED',
  })
  level?: CourseLevel;
}
