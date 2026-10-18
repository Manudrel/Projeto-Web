import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { CourseLevel } from '../course.entity.js';

export class UpdateCourseDto {
  @ApiPropertyOptional({
    description: 'Título do curso',
    example: 'NestJS Avançado',
  })
  @IsOptional()
  @IsString({ message: 'O título deve ser um texto' })
  @IsNotEmpty({ message: 'O título não pode ser vazio' })
  @MaxLength(150, { message: 'O título deve ter no máximo 150 caracteres' })
  title?: string;

  @ApiPropertyOptional({ description: 'Descrição do curso' })
  @IsOptional()
  @IsString({ message: 'A descrição deve ser um texto' })
  @IsNotEmpty({ message: 'A descrição não pode ser vazia' })
  @MaxLength(200, { message: 'A descrição deve ter no máximo 200 caracteres' })
  description?: string;

  @ApiPropertyOptional({ description: 'Id da categoria', example: 1 })
  @IsOptional()
  @IsInt({ message: 'O categoryId deve ser um número inteiro' })
  @Min(1, { message: 'O categoryId deve ser maior que zero' })
  categoryId?: number;

  @ApiPropertyOptional({ description: 'Id do instrutor', example: 2 })
  @IsOptional()
  @IsInt({ message: 'O instructorId deve ser um número inteiro' })
  @Min(1, { message: 'O instructorId deve ser maior que zero' })
  instructorId?: number;

  @ApiPropertyOptional({ description: 'Nível do curso', enum: CourseLevel })
  @IsOptional()
  @IsEnum(CourseLevel, {
    message: 'O nível deve ser BEGINNER, INTERMEDIATE ou ADVANCED',
  })
  level?: CourseLevel;
}