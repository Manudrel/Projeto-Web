import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Min } from 'class-validator';
import { ModuleStatus } from '../course-module.entity.js';

export class UpdateCourseModuleDto {

  @IsOptional()
  @IsString({ message: 'O título deve ser um texto' })
  @IsNotEmpty({ message: 'O título não pode ser vazio' })
  @MaxLength(200, { message: 'O título deve ter no máximo 200 caracteres' })
  title?: string;

  @IsOptional()
  @IsString({ message: 'A descrição deve ser um texto' })
  @IsNotEmpty({ message: 'A descrição não pode ser vazia' })
  @MaxLength(300, { message: 'A descrição deve ter no máximo 300 caracteres' })
  description?: string;

  @IsOptional()
  @IsInt({ message: 'A ordem deve ser um número inteiro' })
  @Min(1, { message: 'A ordem deve ser maior que zero' })
  order?: number;

  @IsOptional()
  @IsEnum(ModuleStatus, { message: 'O status deve ser ACTIVE ou INACTIVE' })
  status?: ModuleStatus;

}
