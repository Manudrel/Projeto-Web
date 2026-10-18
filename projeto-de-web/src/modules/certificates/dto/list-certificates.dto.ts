import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';

const CERTIFICATE_SORT_FIELDS = ['id', 'userId', 'courseId', 'issuedAt'] as const;

export class ListCertificatesDto {
  @ApiPropertyOptional({ description: 'Número da página', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A página deve ser um número inteiro' })
  @Min(1, { message: 'A página deve ser maior que zero' })
  page: number = 1;

  @ApiPropertyOptional({ description: 'Itens por página', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O limite deve ser um número inteiro' })
  @Min(1, { message: 'O limite deve ser maior que zero' })
  @Max(100, { message: 'O limite máximo é 100' })
  limit: number = 10;

  @ApiPropertyOptional({ description: 'Filtra pelo id do aluno', example: 15 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O userId deve ser um número inteiro' })
  @Min(1, { message: 'O userId deve ser maior que zero' })
  userId?: number;

  @ApiPropertyOptional({ description: 'Filtra pelo id do curso', example: 4 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O courseId deve ser um número inteiro' })
  @Min(1, { message: 'O courseId deve ser maior que zero' })
  courseId?: number;

  @ApiPropertyOptional({
    description: 'Campo para ordenação',
    default: 'id',
    enum: CERTIFICATE_SORT_FIELDS,
  })
  @IsOptional()
  @IsIn(CERTIFICATE_SORT_FIELDS, {
    message: 'O campo de ordenação não é válido',
  })
  sortBy: (typeof CERTIFICATE_SORT_FIELDS)[number] = 'id';

  @ApiPropertyOptional({
    description: 'Direção da ordenação',
    default: 'asc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsIn(['asc', 'desc'], {
    message: 'A direção da ordenação deve ser asc ou desc',
  })
  order: 'asc' | 'desc' = 'asc';
}
