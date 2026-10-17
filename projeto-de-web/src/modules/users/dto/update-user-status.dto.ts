import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';
import type { UserStatus } from '../../auth/auth.types.js';

export class UpdateUserStatusDto {
  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE'], example: 'INACTIVE' })
  @IsEnum({ ACTIVE: 'ACTIVE', INACTIVE: 'INACTIVE' })
  status: UserStatus;
}
