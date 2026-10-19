import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsNumber, IsOptional, Max, Min } from 'class-validator';
import { statusEnrollment } from '../enrollment.entity.js';

export class UpdateEnrollmentDto {
  @ApiPropertyOptional({
    description: 'Status da matrícula',
    enum: [statusEnrollment.ACTIVE, statusEnrollment.COMPLETED],
    example: statusEnrollment.ACTIVE,
  })
  @IsOptional()
  @IsIn([statusEnrollment.ACTIVE, statusEnrollment.COMPLETED], {
    message:
          'Status inválido; deve ser ACTIVE ou COMPLETED',
  })
  status?: statusEnrollment;

  @ApiPropertyOptional({
    description: 'Progresso percentual da matrícula',
    example: 25,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 }, {
    message: 'O progresso deve ser um número com até duas casas decimais',
  })
  @Min(0, { message: 'O progresso não pode ser menor que zero' })
  @Max(100, { message: 'O progresso não pode ser maior que 100' })
  progress?: number;
}
