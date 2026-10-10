import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { NivelCurso } from '../curso.entity.js';

export class UpdateCursoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  titulo?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  descricao?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  categoriaId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  instrutorId?: number;

  @IsOptional()
  @IsEnum(NivelCurso)
  nivel?: NivelCurso;

  @IsOptional()
  @IsInt()
  @Min(1)
  cargaHoraria?: number;
}
