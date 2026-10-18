import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { AssessmentType } from '../assessment.entity.js';

export class ListAssessmentsDto {
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
  @IsInt({ message: 'O courseId deve ser um número inteiro' })
  @Min(1, { message: 'O courseId deve ser maior que zero' })
  courseId?: number;

  @IsOptional()
  @IsEnum(AssessmentType, { message: 'O tipo deve ser MODULE ou FINAL' })
  type?: AssessmentType;
}
