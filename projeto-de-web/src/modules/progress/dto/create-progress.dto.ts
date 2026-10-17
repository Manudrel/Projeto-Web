import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateProgressDto {
  @ApiProperty({ description: 'ID da matrícula ativa', example: 1 })
  @IsInt({ message: 'O enrollmentId deve ser um número inteiro' })
  @Min(1, { message: 'O enrollmentId deve ser maior que zero' })
  enrollmentId: number;

  @ApiProperty({ description: 'ID da aula concluída', example: 5 })
  @IsInt({ message: 'O lessonId deve ser um número inteiro' })
  @Min(1, { message: 'O lessonId deve ser maior que zero' })
  lessonId: number;
}
