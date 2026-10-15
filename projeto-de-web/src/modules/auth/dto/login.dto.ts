import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'ana@example.com' })
  @IsEmail()
  @MaxLength(200)
  email: string;

  @ApiProperty({ example: 'SenhaSegura123!' })
  @IsString()
  @MaxLength(128)
  password: string;
}
