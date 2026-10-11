import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class ListCourseProgressDto {
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
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean({ message: 'O completed deve ser true ou false' })
  completed?: boolean;
}
