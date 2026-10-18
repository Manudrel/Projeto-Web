import { ApiProperty } from '@nestjs/swagger';
import { PermissionResource } from '../permission.entity.js';

export class PermissionResponseDto {
  @ApiProperty({ description: 'ID da permissão', example: 1 })
  id: number;

  @ApiProperty({
    description: 'Nome da permissão no formato recurso:ação',
    example: 'courses:create',
  })
  name: string;

  @ApiProperty({
    description: 'Recurso da permissão',
    enum: PermissionResource,
    example: PermissionResource.COURSES,
  })
  resource: PermissionResource;

  @ApiProperty({
    description: 'Descrição da permissão',
    example: 'create courses',
  })
  description: string;

  @ApiProperty({
    description: 'Data de criação da permissão',
    example: '2026-10-17T12:00:00.000Z',
  })
  createdAt: Date;
}

export class PaginationMetaDto {
  @ApiProperty({ description: 'Total de registros encontrados', example: 10 })
  total: number;

  @ApiProperty({ description: 'Página atual', example: 1 })
  page: number;

  @ApiProperty({ description: 'Quantidade de registros por página', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total de páginas', example: 1 })
  totalPages: number;
}

export class PaginatedPermissionsResponseDto {
  @ApiProperty({
    description: 'Lista de permissões',
    type: [PermissionResponseDto],
  })
  data: PermissionResponseDto[];

  @ApiProperty({
    description: 'Metadados da paginação',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}

