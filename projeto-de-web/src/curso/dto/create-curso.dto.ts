import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';
import { NivelCurso } from '../curso.entity.js';

export class CreateCursoDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(150)
  titulo: string;

  @IsString()
  @IsNotEmpty()
  descricao: string;

  @IsInt()
  @Min(1)
  categoriaId: number;

  @IsInt()
  @Min(1)
  instrutorId: number;

  @IsEnum(NivelCurso)
  nivel: NivelCurso;

  @IsInt()
  @Min(1)
  cargaHoraria: number;
}
