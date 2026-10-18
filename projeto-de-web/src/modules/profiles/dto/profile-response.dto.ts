import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProfileRole, ProfileStatus } from '../profile.entity.js';

export class ProfileResponseDto {
  @ApiProperty({ description: 'ID do perfil', example: 1 })
  id: number;

  @ApiProperty({ description: 'Nome do perfil', example: 'Administrator' })
  name: string;

  @ApiProperty({
    description: 'Papel associado ao perfil',
    enum: ProfileRole,
    example: ProfileRole.ADMIN,
  })
  role: ProfileRole;

  @ApiProperty({
    description: 'Descrição das atribuições do perfil',
    example: 'Full platform access',
  })
  description: string;

  @ApiProperty({
    description: 'Status do perfil',
    enum: ProfileStatus,
    example: ProfileStatus.ACTIVE,
  })
  status: ProfileStatus;

  @ApiProperty({
    description: 'Data de criação do perfil',
    example: '2026-10-17T12:00:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data da última atualização',
    example: '2026-10-17T12:00:00.000Z',
  })
  updatedAt: Date;

  @ApiPropertyOptional({
    description: 'Data de exclusão lógica (soft delete)',
    example: null,
    nullable: true,
  })
  deletedAt: Date | null;

  @ApiPropertyOptional({
    description: 'Nomes das permissões vinculadas ao perfil',
    example: ['users:read', 'courses:create', 'courses:read'],
    type: [String],
  })
  permissions?: string[];
}

export class PaginationMetaDto {
  @ApiProperty({ description: 'Total de registros encontrados', example: 3 })
  total: number;

  @ApiProperty({ description: 'Página atual', example: 1 })
  page: number;

  @ApiProperty({ description: 'Quantidade de registros por página', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total de páginas', example: 1 })
  totalPages: number;
}

export class PaginatedProfilesResponseDto {
  @ApiProperty({
    description: 'Lista de perfis',
    type: [ProfileResponseDto],
  })
  data: ProfileResponseDto[];

  @ApiProperty({
    description: 'Metadados da paginação',
    type: PaginationMetaDto,
  })
  meta: PaginationMetaDto;
}

