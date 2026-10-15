import { IsEnum, IsNotEmpty, IsOptional, IsString, MaxLength, } from 'class-validator';
import { CategoryStatus } from '../category.entity.js';

export class UpdateCategoryDto {

  @IsOptional()
  @IsString({ message: 'O nome deve ser um texto' })
  @IsNotEmpty({ message: 'O nome não pode ser vazio' })
  @MaxLength(150, { message: 'O nome deve ter no máximo 150 caracteres' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'A descrição deve ser um texto' })
  @IsNotEmpty({ message: 'A descrição não pode ser vazia' })
  @MaxLength(200, { message: 'A descrição deve ter no máximo 200 caracteres' })
  description?: string;

  @IsOptional()
  @IsEnum(CategoryStatus, {
    message: 'O status deve ser ACTIVE ou INACTIVE',
  })
  status?: CategoryStatus;


}
