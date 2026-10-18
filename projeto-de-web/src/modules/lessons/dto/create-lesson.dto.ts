import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { TypeLesson } from '../lessons.entity.js';

export class CreateLessonDto {
  @ApiProperty({
    example: 1,
    description: 'ID do módulo ao qual a aula pertence',
  })
  @IsInt()
  moduleId!: number;

  @ApiProperty({
    example: 2,
    description: 'Posição da aula no módulo; se omitida, será adicionada ao final',
    required: false,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'A ordem deve ser um número inteiro' })
  @Min(1, { message: 'A ordem deve ser maior que zero' })
  order?: number;

  @ApiProperty({
    example: 'Introdução ao TypeScript',
    description: 'Título da aula',
  })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({
    example: 'Nesta aula, aprenderemos os conceitos básicos do TypeScript.',
    description: 'Conteúdo da aula',
  })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiProperty({
    enum: TypeLesson,
    example: TypeLesson.VIDEO,
    description: 'Tipo de conteúdo da aula',
  })
  @IsEnum(TypeLesson)
  type!: TypeLesson;
}
