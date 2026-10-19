import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { TypeLesson } from '../lessons.entity.js';

export class ListLessonsDto {
  @ApiPropertyOptional({
    description: 'Filtra as aulas de um módulo específico',
    example: 2,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O moduleId deve ser um número inteiro' })
  @Min(1, { message: 'O moduleId deve ser maior que zero' })
  moduleId?: number;

  @ApiPropertyOptional({
    description: 'Filtra pelo tipo da aula',
    enum: TypeLesson,
  })
  @IsOptional()
  @IsEnum(TypeLesson, { message: 'Tipo de aula inválido' })
  type?: TypeLesson;

  @ApiPropertyOptional({ description: 'Número da página', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A página deve ser um número inteiro' })
  @Min(1, { message: 'A página deve ser maior que zero' })
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Quantidade de aulas por página (máximo 100)',
    default: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O limite deve ser um número inteiro' })
  @Min(1, { message: 'O limite deve ser maior que zero' })
  @Max(100, { message: 'O limite máximo é 100' })
  limit: number = 10;
}
