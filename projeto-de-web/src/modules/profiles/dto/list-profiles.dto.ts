import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min, } from 'class-validator';
import { ProfileRole, ProfileStatus } from '../profile.entity.js';

export class ListProfilesDto {
  @ApiPropertyOptional({ description: 'Número da página', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A página deve ser um número inteiro' })
  @Min(1, { message: 'A página deve ser maior que zero' })
  page: number = 1;

  @ApiPropertyOptional({ description: 'Itens por página', default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O limite deve ser um número inteiro' })
  @Min(1, { message: 'O limite deve ser maior que zero' })
  @Max(100, { message: 'O limite máximo é 100' })
  limit: number = 10;

  @ApiPropertyOptional({
    description: 'Filtra pelo nome do perfil (busca parcial)',
    example: 'Admin',
  })
  @IsOptional()
  @IsString({ message: 'O nome deve ser um texto' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Filtra pelo papel do perfil',
    enum: ProfileRole,
  })
  @IsOptional()
  @IsEnum(ProfileRole, {
    message: 'O role deve ser ADMIN, INSTRUCTOR ou STUDENT',
  })
  role?: ProfileRole;

  @ApiPropertyOptional({
    description: 'Filtra pelo status do perfil',
    enum: ProfileStatus,
  })
  @IsOptional()
  @IsEnum(ProfileStatus, {
    message: 'O status deve ser ACTIVE ou INACTIVE',
  })
  status?: ProfileStatus;

  @ApiPropertyOptional({
    description: 'Campo para ordenação',
    default: 'id',
    enum: ['id', 'name', 'role', 'status', 'createdAt', 'updatedAt'],
  })
  @IsOptional()
  @IsString({ message: 'O campo de ordenação deve ser um texto' })
  sortBy?: string = 'id';

  @ApiPropertyOptional({
    description: 'Direção da ordenação',
    default: 'asc',
    enum: ['asc', 'desc'],
  })
  @IsOptional()
  @IsEnum(['asc', 'desc'], {
    message: 'A direção da ordenação deve ser asc ou desc',
  })
  order?: 'asc' | 'desc' = 'asc';
}
