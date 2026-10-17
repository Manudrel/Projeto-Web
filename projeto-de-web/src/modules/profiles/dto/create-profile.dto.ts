import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min, } from 'class-validator';
import { ProfileRole } from '../profile.entity.js';

export class CreateProfileDto {
  @ApiProperty({
    description: 'Nome do perfil',
    example: 'Coordenador',
  })
  @IsString({ message: 'O nome deve ser um texto' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @MaxLength(150, { message: 'O nome deve ter no máximo 150 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Papel do perfil no sistema',
    enum: ProfileRole,
    example: ProfileRole.INSTRUCTOR,
  })
  @IsEnum(ProfileRole, {
    message: 'O role deve ser ADMIN, INSTRUCTOR ou STUDENT',
  })
  role: ProfileRole;

  @ApiProperty({
    description: 'Descrição das atribuições do perfil',
    example: 'Perfil com permissões para gerenciar turmas e coordenar cursos',
  })
  @IsString({ message: 'A descrição deve ser um texto' })
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  @MaxLength(200, { message: 'A descrição deve ter no máximo 200 caracteres' })
  description: string;

  @ApiPropertyOptional({
    description: 'Lista de IDs das permissões vinculadas ao perfil',
    example: [1, 2, 5],
    type: [Number],
  })
  @IsOptional()
  @IsArray({ message: 'permissionIds deve ser um array' })
  @IsInt({ each: true, message: 'Cada permissionId deve ser um número inteiro' })
  @Min(1, { each: true, message: 'Cada permissionId deve ser maior que zero' })
  permissionIds?: number[];
}
