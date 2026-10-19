import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNumber, Max, Min } from 'class-validator';

export class CreateAssessmentAttemptDto {
  @ApiProperty({
    description: 'ID da matrícula ativa do aluno no curso',
    example: 1,
  })
  @IsInt({ message: 'O enrollmentId deve ser um número inteiro' })
  @Min(1, { message: 'O enrollmentId deve ser maior que zero' })
  enrollmentId: number;

  @ApiProperty({
    description: 'Nota obtida na tentativa (0 a 100)',
    example: 85.5,
  })
  @Type(() => Number)
  @IsNumber({}, { message: 'A nota deve ser um número' })
  @Min(0, { message: 'A nota deve ser no mínimo zero' })
  @Max(100, { message: 'A nota máxima é 100' })
  score: number;
}
