import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { CategoryStatus } from '../category.entity.js';

export class ListCategoriesDto {
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

  @ApiPropertyOptional({ description: 'Filtra pelo nome da categoria (busca parcial)' })
  @IsOptional()
  @IsString({ message: 'O nome deve ser um texto' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Filtra pelo status da categoria',
    enum: CategoryStatus,
  })
  @IsOptional()
  @IsEnum(CategoryStatus, {
    message: 'O status deve ser ACTIVE ou INACTIVE',
  })
  status?: CategoryStatus;

  @ApiPropertyOptional({
    description: 'Campo para ordenação',
    default: 'id',
    enum: ['id', 'name', 'status', 'createdAt', 'updatedAt'],
  })
  @IsOptional()
  @IsString({ message: 'O campo de ordenação deve ser um texto' })
  sortBy?: string = 'id';

  @ApiPropertyOptional({
    description: 'Direção da ordenação',
    default: 'asc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'], {
    message: 'A direção da ordenação deve ser asc ou desc',
  })
  order?: 'asc' | 'desc' = 'asc';
}
