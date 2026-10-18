import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class CreateEnrollmentDto {
  @ApiProperty({ description: 'ID do usuário que será matriculado', example: 2 })
  @Type(() => Number)
  @IsInt({ message: 'O userId deve ser um número inteiro' })
  @Min(1, { message: 'O userId deve ser maior que zero' })
  userId!: number;

  @ApiProperty({ description: 'ID do curso da matrícula', example: 1 })
  @Type(() => Number)
  @IsInt({ message: 'O courseId deve ser um número inteiro' })
  @Min(1, { message: 'O courseId deve ser maior que zero' })
  courseId!: number;
}
