import { Type } from 'class-transformer';
import { IsIn, IsInt, IsNumber, IsOptional, Max, Min } from 'class-validator';

export class ListCourseStudentsDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A página deve ser um número inteiro' })
  @Min(1, { message: 'A página deve ser maior que zero' })
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O limite deve ser um número inteiro' })
  @Min(1, { message: 'O limite deve ser maior que zero' })
  limit: number = 20;

  @IsOptional()
  @IsIn(['ACTIVE', 'CANCELED', 'COMPLETED'], {
    message: 'O status deve ser ACTIVE, CANCELED ou COMPLETED',
  })
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({}, { message: 'O progresso deve ser um número' })
  @Min(0, { message: 'O progresso deve ser no mínimo 0' })
  @Max(100, { message: 'O progresso deve ser no máximo 100' })
  progress?: number;
}
