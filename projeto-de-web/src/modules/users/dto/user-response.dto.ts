import { ApiProperty } from '@nestjs/swagger';
import type { UserRole, UserStatus } from '../user.entity.js';

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

export class UserMessageResponseDto {
  @ApiProperty({ example: 'Senha atualizada com sucesso.' })
  message: string;
}
