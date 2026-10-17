import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @ApiProperty({ description: 'Token recebido no link de redefinição' })
  @IsString()
  @MinLength(32)
  @MaxLength(256)
  token: string;

  @ApiProperty({ description: 'Nova senha com no mínimo 8 caracteres' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  newPassword: string;
}
