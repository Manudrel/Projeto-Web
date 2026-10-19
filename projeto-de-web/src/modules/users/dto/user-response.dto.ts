import { ApiProperty } from '@nestjs/swagger';
import type { UserRole, UserStatus } from '../../auth/auth.types.js';

export class UserProfileResponseDto {
  @ApiProperty({ example: 2 })
  id: number;

  @ApiProperty({ example: 'Instructor' })
  name: string;

  @ApiProperty({ enum: ['ADMIN', 'INSTRUCTOR', 'STUDENT'], example: 'INSTRUCTOR' })
  role: UserRole;
}

export class UserResponseDto {
  @ApiProperty({ example: 15 })
  id: number;

  @ApiProperty({ example: 'Ana Silva' })
  name: string;

  @ApiProperty({ example: 'ana@example.com' })
  email: string;

  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE'], example: 'ACTIVE' })
  status: UserStatus;

  @ApiProperty({ type: UserProfileResponseDto })
  profile: UserProfileResponseDto;

  @ApiProperty({ example: '2026-10-15T12:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2026-10-15T12:00:00.000Z' })
  updatedAt: string;
}

export class UsersPaginationMetaDto {
  @ApiProperty({ example: 45 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}

export class PaginatedUsersResponseDto {
  @ApiProperty({ type: [UserResponseDto] })
  data: UserResponseDto[];

  @ApiProperty({ type: UsersPaginationMetaDto })
  meta: UsersPaginationMetaDto;
}

export class UserMessageResponseDto {
  @ApiProperty({ example: 'Senha atualizada com sucesso.' })
  message: string;
}
