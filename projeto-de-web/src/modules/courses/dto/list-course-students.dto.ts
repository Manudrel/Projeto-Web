import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class ListCourseStudentsDto {
  @ApiPropertyOptional({ description: 'Número da página', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A página deve ser um número inteiro' })
  @Min(1, { message: 'A página deve ser maior que zero' })
  page: number = 1;

  @ApiPropertyOptional({ description: 'Itens por página', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O limite deve ser um número inteiro' })
  @Min(1, { message: 'O limite deve ser maior que zero' })
  limit: number = 20;

  @ApiPropertyOptional({
    description: 'Filtra pelo status da matrícula',
    enum: ['ACTIVE', 'CANCELED', 'COMPLETED'],
  })
  @IsOptional()
  @IsIn(['ACTIVE', 'CANCELED', 'COMPLETED'], {
    message: 'O status deve ser ACTIVE, CANCELED ou COMPLETED',
  })
  status?: string;

  @ApiPropertyOptional({
    description: 'Progresso mínimo do aluno (0 a 100)',
    example: 50,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'O progresso deve ser um número' })
  @Min(0, { message: 'O progresso deve ser no mínimo 0' })
  @Max(100, { message: 'O progresso deve ser no máximo 100' })
  progress?: number;
}