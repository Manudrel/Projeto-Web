import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { statusEnrollment } from '../enrollment.entity.js';

export class ListEnrollmentsDto {
  @ApiPropertyOptional({ description: 'Número da página', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A página deve ser um número inteiro' })
  @Min(1, { message: 'A página deve ser maior que zero' })
  page: number = 1;

  @ApiPropertyOptional({ description: 'Itens por página', default: 10, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O limite deve ser um número inteiro' })
  @Min(1, { message: 'O limite deve ser maior que zero' })
  @Max(100, { message: 'O limite máximo é 100' })
  limit: number = 10;

  @ApiPropertyOptional({ description: 'Filtra pelo ID do usuário', example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O userId deve ser um número inteiro' })
  @Min(1, { message: 'O userId deve ser maior que zero' })
  userId?: number;

  @ApiPropertyOptional({ description: 'Filtra pelo ID do curso', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O courseId deve ser um número inteiro' })
  @Min(1, { message: 'O courseId deve ser maior que zero' })
  courseId?: number;

  @ApiPropertyOptional({ description: 'Filtra pelo status da matrícula', enum: statusEnrollment })
  @IsOptional()
  @IsEnum(statusEnrollment, {
    message: 'O status deve ser ACTIVE, CANCELLED ou COMPLETED',
  })
  status?: statusEnrollment;
}
