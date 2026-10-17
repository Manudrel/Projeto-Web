import { IsInt, Min } from 'class-validator';

export class CreateProgressDto {
  @IsInt({ message: 'O enrollmentId deve ser um número inteiro' })
  @Min(1, { message: 'O enrollmentId deve ser maior que zero' })
  enrollmentId: number;

  @IsInt({ message: 'O lessonId deve ser um número inteiro' })
  @Min(1, { message: 'O lessonId deve ser maior que zero' })
  lessonId: number;
}
