import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { AssessmentType } from '../assessment.entity.js';

export class ListAssessmentsDto {
  @ApiPropertyOptional({
    description: 'Número da página',
    example: 1,
    default: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A página deve ser um número inteiro' })
  @Min(1, { message: 'A página deve ser maior que zero' })
  page: number = 1;

  @ApiPropertyOptional({
    description: 'Quantidade de registros por página',
    example: 20,
    default: 20,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O limite deve ser um número inteiro' })
  @Min(1, { message: 'O limite deve ser maior que zero' })
  limit: number = 20;

  @ApiPropertyOptional({
    description: 'Filtrar por ID do curso',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O courseId deve ser um número inteiro' })
  @Min(1, { message: 'O courseId deve ser maior que zero' })
  courseId?: number;

  @ApiPropertyOptional({
    enum: AssessmentType,
    description: 'Filtrar por tipo de avaliação (MODULE ou FINAL)',
    example: AssessmentType.FINAL,
  })
  @IsOptional()
  @IsEnum(AssessmentType, { message: 'O tipo deve ser MODULE ou FINAL' })
  type?: AssessmentType;
}
