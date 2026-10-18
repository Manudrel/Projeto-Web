import { ApiProperty } from '@nestjs/swagger';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { CourseLevel } from '../course.entity.js';

export class CreateCourseDto {
  @ApiProperty({ description: 'Título do curso', example: 'NestJS do Zero' })
  @IsString({ message: 'O título deve ser um texto' })
  @IsNotEmpty({ message: 'O título é obrigatório' })
  @MaxLength(150, { message: 'O título deve ter no máximo 150 caracteres' })
  title: string;

  @ApiProperty({
    description: 'Descrição do curso',
    example: 'Construa APIs REST com NestJS',
  })
  @IsString({ message: 'A descrição deve ser um texto' })
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  @MaxLength(200, { message: 'A descrição deve ter no máximo 200 caracteres' })
  description: string;

  @ApiProperty({ description: 'Id da categoria', example: 1 })
  @IsInt({ message: 'O categoryId deve ser um número inteiro' })
  @Min(1, { message: 'O categoryId deve ser maior que zero' })
  categoryId: number;

  @ApiProperty({ description: 'Id do instrutor', example: 2 })
  @IsInt({ message: 'O instructorId deve ser um número inteiro' })
  @Min(1, { message: 'O instructorId deve ser maior que zero' })
  instructorId: number;

  @ApiProperty({ description: 'Nível do curso', enum: CourseLevel })
  @IsEnum(CourseLevel, {
    message: 'O nível deve ser BEGINNER, INTERMEDIATE ou ADVANCED',
  })
  level: CourseLevel;
}