import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateUserPasswordDto {
  @ApiPropertyOptional({ description: 'Obrigatória ao alterar a própria senha', minLength: 8, maxLength: 72 })
  @IsOptional()
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  currentPassword?: string;

  @ApiProperty({ minLength: 8, maxLength: 72, example: 'NovaSenhaForte456' })
  @IsString()
  @MinLength(8)
  @MaxLength(72)
  newPassword: string;
}
