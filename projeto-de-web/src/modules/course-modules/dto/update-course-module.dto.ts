import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ModuleStatus } from '../course-module.entity.js';

export class UpdateCourseModuleDto {

  @ApiPropertyOptional({
    description: 'Título do módulo',
    example: 'Introdução ao NestJS',
  })
  @IsOptional()
  @IsString({ message: 'O título deve ser um texto' })
  @IsNotEmpty({ message: 'O título não pode ser vazio' })
  @MaxLength(200, { message: 'O título deve ter no máximo 200 caracteres' })
  title?: string;

  @ApiPropertyOptional({
    description: 'Descrição do módulo',
    example: 'Conceitos básicos, controllers, services e injeção de dependências',
  })
  @IsOptional()
  @IsString({ message: 'A descrição deve ser um texto' })
  @IsNotEmpty({ message: 'A descrição não pode ser vazia' })
  @MaxLength(300, { message: 'A descrição deve ter no máximo 300 caracteres' })
  description?: string;

  @ApiPropertyOptional({
    description: 'Ordem de exibição do módulo no curso',
    example: 1,
  })
  @IsOptional()
  @IsInt({ message: 'A ordem deve ser um número inteiro' })
  @Min(1, { message: 'A ordem deve ser maior que zero' })
  order?: number;

  @ApiPropertyOptional({
    description: 'Status do módulo',
    enum: ModuleStatus,
  })
  @IsOptional()
  @IsEnum(ModuleStatus, { message: 'O status deve ser ACTIVE ou INACTIVE' })
  status?: ModuleStatus;

}
