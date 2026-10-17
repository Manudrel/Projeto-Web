import { Type } from 'class-transformer';
import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class CreateAssessmentAttemptDto {
  @IsInt({ message: 'O enrollmentId deve ser um número inteiro' })
  @Min(1, { message: 'O enrollmentId deve ser maior que zero' })
  enrollmentId: number;

  @Type(() => Number)
  @IsNumber({}, { message: 'A nota deve ser um número' })
  @Min(0, { message: 'A nota deve ser no mínimo zero' })
  @Max(100, { message: 'A nota máxima é 100' })
  score: number;
}
