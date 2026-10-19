import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { AssessmentType } from '../assessment.entity.js';

export class CreateAssessmentDto {
  @ApiProperty({ description: 'ID do curso', example: 1 })
  @IsInt({ message: 'O courseId deve ser um número inteiro' })
  @Min(1, { message: 'O courseId deve ser maior que zero' })
  courseId: number;

  @ApiPropertyOptional({
    description: 'ID do módulo (obrigatório se o tipo for MODULE)',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'O moduleId deve ser um número inteiro' })
  @Min(1, { message: 'O moduleId deve ser maior que zero' })
  moduleId?: number;

  @ApiProperty({
    description: 'Título da avaliação',
    example: 'Avaliação Final de NestJS',
  })
  @IsString({ message: 'O título deve ser um texto' })
  @IsNotEmpty({ message: 'O título não pode ser vazio' })
  @MaxLength(300, { message: 'O título deve ter no máximo 300 caracteres' })
  title: string;

  @ApiProperty({
    enum: AssessmentType,
    description: 'Tipo da avaliação (MODULE ou FINAL)',
    example: AssessmentType.FINAL,
  })
  @IsEnum(AssessmentType, { message: 'O tipo deve ser MODULE ou FINAL' })
  type: AssessmentType;

  @ApiProperty({
    description: 'Nota mínima para aprovação (0 a 100)',
    example: 70.0,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'A nota mínima para aprovação deve ser um número' })
  @Min(0, { message: 'A nota mínima deve ser maior ou igual a zero' })
  @Max(100, { message: 'A nota máxima permitida é 100' })
  minScoreToPass: number;

  @ApiPropertyOptional({
    description: 'Número máximo de tentativas permitidas',
    example: 3,
    default: 3,
  })
  @IsOptional()
  @IsInt({ message: 'O número máximo de tentativas deve ser um número inteiro' })
  @Min(1, { message: 'O número de tentativas deve ser maior que zero' })
  maxAttempts?: number;
}
