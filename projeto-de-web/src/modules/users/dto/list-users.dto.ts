import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsIn, IsInt, IsOptional, Max, Min } from 'class-validator';
import type { UserStatus } from '../user.entity.js';

const USER_SORT_FIELDS = ['id', 'name', 'email', 'status', 'createdAt'] as const;

export class ListUsersDto {
  @ApiPropertyOptional({ type: Number, description: 'Número da página', default: 1, minimum: 1 })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? 1 : Number(value)))
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ type: Number, description: 'Itens por página', default: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? 10 : Number(value)))
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @ApiPropertyOptional({ description: 'Filtra pelo status', enum: ['ACTIVE', 'INACTIVE'] })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsEnum({ ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' })
  status?: UserStatus;

  @ApiPropertyOptional({ description: 'Filtra pelo id do perfil', example: 1, minimum: 1 })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? undefined : Number(value)))
  @IsInt()
  @Min(1)
  profileId?: number;

  @ApiPropertyOptional({ description: 'Campo de ordenação', enum: USER_SORT_FIELDS, default: 'id' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? 'id' : value))
  @IsIn(USER_SORT_FIELDS)
  sortBy: (typeof USER_SORT_FIELDS)[number] = 'id';

  @ApiPropertyOptional({ description: 'Direção da ordenação', enum: ['asc', 'desc'], default: 'desc' })
  @IsOptional()
  @Transform(({ value }) => (value === '' ? 'desc' : value))
  @IsIn(['asc', 'desc'])
  order: 'asc' | 'desc' = 'desc';
}
