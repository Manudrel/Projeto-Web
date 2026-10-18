import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, MaxLength, } from 'class-validator';
import { PermissionResource } from '../permission.entity.js';

export class CreatePermissionDto {
  @ApiProperty({
    description: 'Nome único da permissão no formato recurso:ação',
    example: 'courses:publish',
  })
  @IsString({ message: 'O nome deve ser um texto' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @MaxLength(150, { message: 'O nome deve ter no máximo 150 caracteres' })
  name: string;

  @ApiProperty({
    description: 'Recurso ao qual a permissão pertence',
    enum: PermissionResource,
    example: PermissionResource.COURSES,
  })
  @IsEnum(PermissionResource, {
    message:
      'O recurso deve ser um dos seguintes: USERS, PROFILES, PERMISSIONS, CATEGORIES, COURSES, MODULES, LESSONS, ENROLLMENTS, PROGRESS, ASSESSMENTS, CERTIFICATES',
  })
  resource: PermissionResource;

  @ApiProperty({
    description: 'Descrição detalhada do que a permissão permite fazer',
    example: 'Permite publicar e disponibilizar um curso para matrículas',
  })
  @IsString({ message: 'A descrição deve ser um texto' })
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  @MaxLength(300, { message: 'A descrição deve ter no máximo 300 caracteres' })
  description: string;
}

