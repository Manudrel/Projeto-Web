import { ApiProperty } from '@nestjs/swagger';
import type { UserRole, UserStatus } from '../../users/user.entity.js';

export class AuthProfileResponseDto {
  @ApiProperty({ example: 3 })
  id: number;

  @ApiProperty({ example: 'Student' })
  name: string;

  @ApiProperty({ enum: ['ADMIN', 'INSTRUCTOR', 'STUDENT'], example: 'STUDENT' })
  role: UserRole;
}

export class AuthUserResponseDto {
  @ApiProperty({ example: 42 })
  id: number;

  @ApiProperty({ example: 'Ana Silva' })
  name: string;

  @ApiProperty({ example: 'ana@example.com' })
  email: string;

  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE'], example: 'ACTIVE' })
  status: UserStatus;

  @ApiProperty({ type: AuthProfileResponseDto })
  profile: AuthProfileResponseDto;

  @ApiProperty({ type: [String], example: ['courses:read'] })
  permissions: string[];
}

export class AuthSessionResponseDto {
  @ApiProperty({
    description: 'JWT de acesso',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  accessToken: string;

  @ApiProperty({ description: 'Token de renovação rotacionado' })
  refreshToken: string;

  @ApiProperty({ example: 'Bearer' })
  tokenType: string;

  @ApiProperty({
    example: 900,
    description: 'Validade do access token em segundos',
  })
  expiresIn: number;
}

export class AuthMessageResponseDto {
  @ApiProperty({
    example: 'Se os dados forem válidos, você receberá as instruções.',
  })
  message: string;
}
