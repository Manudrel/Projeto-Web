import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, } from 'class-validator';
import { PermissionResource } from '../permission.entity.js';

export class UpdatePermissionDto {
  @ApiPropertyOptional({
    description: 'Nome único da permissão no formato recurso:ação',
    example: 'courses:unpublish',
  })
  @IsOptional()
  @IsString({ message: 'O nome deve ser um texto' })
  @IsNotEmpty({ message: 'O nome não pode ser vazio' })
  @MaxLength(150, { message: 'O nome deve ter no máximo 150 caracteres' })
  name?: string;

  @ApiPropertyOptional({
    description: 'Recurso ao qual a permissão pertence',
    enum: PermissionResource,
    example: PermissionResource.COURSES,
  })
  @IsOptional()
  @IsEnum(PermissionResource, {
    message:
      'O recurso deve ser um dos seguintes: USERS, PROFILES, PERMISSIONS, CATEGORIES, COURSES, MODULES, LESSONS, ENROLLMENTS, PROGRESS, ASSESSMENTS, CERTIFICATES',
  })
  resource?: PermissionResource;

  @ApiPropertyOptional({
    description: 'Descrição detalhada da permissão',
    example: 'Permite despublicar um curso',
  })
  @IsOptional()
  @IsString({ message: 'A descrição deve ser um texto' })
  @IsNotEmpty({ message: 'A descrição não pode ser vazia' })
  @MaxLength(300, { message: 'A descrição deve ter no máximo 300 caracteres' })
  description?: string;
}

