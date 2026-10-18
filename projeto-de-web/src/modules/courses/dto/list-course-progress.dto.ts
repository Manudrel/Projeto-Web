import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsBoolean, IsIn, IsInt, IsOptional, Min } from 'class-validator';

export class ListCourseProgressDto {
  @ApiPropertyOptional({ description: 'Número da página', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A página deve ser um número inteiro' })
  @Min(1, { message: 'A página deve ser maior que zero' })
  page: number = 1;

  @ApiPropertyOptional({ description: 'Itens por página', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'O limite deve ser um número inteiro' })
  @Min(1, { message: 'O limite deve ser maior que zero' })
  limit: number = 20;

  @ApiPropertyOptional({
    description: 'Filtra pelo status da matrícula',
    enum: ['ACTIVE', 'CANCELED', 'COMPLETED'],
  })
  @IsOptional()
  @IsIn(['ACTIVE', 'CANCELED', 'COMPLETED'], {
    message: 'O status deve ser ACTIVE, CANCELED ou COMPLETED',
  })
  status?: string;

  @ApiPropertyOptional({
    description: 'Filtra aulas concluídas ou não',
    type: Boolean,
  })
  @IsOptional()
  @Transform(({ value }) =>
    value === 'true' ? true : value === 'false' ? false : value,
  )
  @IsBoolean({ message: 'O completed deve ser true ou false' })
  completed?: boolean;
}