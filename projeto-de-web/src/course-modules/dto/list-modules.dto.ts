import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';
import { ModuleStatus } from '../course-module.entity.js';

export class ListModulesDto {
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
  @Type(() => Number)
  @IsInt({ message: 'O courseId deve ser um número inteiro' })
  @Min(1, { message: 'O courseId deve ser maior que zero' })
  courseId?: number;

  @IsOptional()
  @IsEnum(ModuleStatus, { message: 'O status deve ser ACTIVE ou INACTIVE' })
  status?: ModuleStatus;
}
