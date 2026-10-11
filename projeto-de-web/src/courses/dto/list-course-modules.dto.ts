import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class ListCourseModulesDto {
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
  @IsIn(['ACTIVE', 'INACTIVE'], {
    message: 'O status deve ser ACTIVE ou INACTIVE',
  })
  status?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A ordem deve ser um número inteiro' })
  @Min(1, { message: 'A ordem deve ser maior que zero' })
  order?: number;
}
