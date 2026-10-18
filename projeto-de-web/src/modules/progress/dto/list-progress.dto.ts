import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Min } from 'class-validator';

export class ListProgressDto {
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

  @ApiPropertyOptional({ description: 'Filtra pelo ID do usuário', example: 2 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O userId deve ser um número inteiro' })
  @Min(1, { message: 'O userId deve ser maior que zero' })
  userId?: number;

  @ApiPropertyOptional({ description: 'Filtra pelo ID do curso', example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O courseId deve ser um número inteiro' })
  @Min(1, { message: 'O courseId deve ser maior que zero' })
  courseId?: number;
}
