import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'Nome completo',
    example: 'Ana Silva',
    maxLength: 150,
  })
  @IsString()
  @MaxLength(150)
  name: string;

  @ApiProperty({
    description: 'E-mail de acesso',
    example: 'ana@example.com',
    maxLength: 200,
  })
  @IsEmail()
  @MaxLength(200)
  email: string;

  @ApiProperty({
    description: 'Senha com no mínimo 8 caracteres',
    example: 'SenhaSegura123!',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password: string;
}
