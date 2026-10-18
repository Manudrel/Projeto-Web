import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Min } from 'class-validator';

export class CreateCertificateDto {
  @ApiProperty({
    description: 'Id do aluno que receberá o certificado',
    example: 15,
  })
  @IsInt({ message: 'O userId deve ser um número inteiro' })
  @Min(1, { message: 'O userId deve ser maior que zero' })
  userId: number;

  @ApiProperty({ description: 'Id do curso concluído', example: 4 })
  @IsInt({ message: 'O courseId deve ser um número inteiro' })
  @Min(1, { message: 'O courseId deve ser maior que zero' })
  courseId: number;
}
