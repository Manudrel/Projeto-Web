import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsInt, IsNotEmpty, IsString } from 'class-validator';
import { TypeLesson } from '../lessons.entity.js';

export class CreateLessonDto {
  @ApiProperty({
    example: 1,
    description: 'ID do módulo ao qual a aula pertence',
  })
  @IsInt()
  moduleId!: number;

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