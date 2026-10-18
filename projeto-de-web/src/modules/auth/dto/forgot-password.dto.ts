import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, MaxLength } from 'class-validator';

export class ForgotPasswordDto {
  @ApiProperty({ example: 'ana@example.com' })
  @IsEmail()
  @MaxLength(200)
  email: string;
}
