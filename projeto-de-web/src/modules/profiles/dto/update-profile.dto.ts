import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min, } from 'class-validator';
import { ProfileRole, ProfileStatus } from '../profile.entity.js';

export class UpdateProfileDto {
  @ApiPropertyOptional({
    description: 'Nome do perfil',
    example: 'Coordenador Pedagógico',
  })
  @IsOptional()
  @IsString({ message: 'O nome deve ser um texto' })
  @IsNotEmpty({ message: 'O nome não pode ser vazio' })
  @MaxLength(150, { message: 'O nome deve ter no máximo 150 caracteres' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Papel do perfil no sistema',
    enum: ProfileRole,
    example: ProfileRole.INSTRUCTOR,
  })
  @IsOptional()
  @IsEnum(ProfileRole, {
    message: 'O role deve ser ADMIN, INSTRUCTOR ou STUDENT',
  })
  role?: ProfileRole;

  @ApiPropertyOptional({
    description: 'Descrição das atribuições do perfil',
    example: 'Atualização das atribuições do perfil de coordenação',
  })
  @IsOptional()
  @IsString({ message: 'A descrição deve ser um texto' })
  @IsNotEmpty({ message: 'A descrição não pode ser vazia' })
  @MaxLength(200, { message: 'A descrição deve ter no máximo 200 caracteres' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Status do perfil',
    enum: ProfileStatus,
    example: ProfileStatus.ACTIVE,
  })
  @IsOptional()
  @IsEnum(ProfileStatus, {
    message: 'O status deve ser ACTIVE ou INACTIVE',
  })
  status?: ProfileStatus;

  @ApiPropertyOptional({
    description: 'Lista de IDs das permissões vinculadas ao perfil (substitui a lista atual)',
    example: [1, 3, 7],
    type: [Number],
  })
  @IsOptional()
  @IsArray({ message: 'permissionIds deve ser um array' })
  @IsInt({ each: true, message: 'Cada permissionId deve ser um número inteiro' })
  @Min(1, { each: true, message: 'Cada permissionId deve ser maior que zero' })
  permissionIds?: number[];
}
