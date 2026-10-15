import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateCategoryDto {

  @IsString({ message: 'O nome deve ser um texto' })
  @IsNotEmpty({ message: 'O nome é obrigatório' })
  @MaxLength(150, { message: 'O nome deve ter no máximo 150 caracteres' })
  name: string;

  @IsString({ message: 'A descrição deve ser um texto' })
  @IsNotEmpty({ message: 'A descrição é obrigatória' })
  @MaxLength(200, { message: 'A descrição deve ter no máximo 200 caracteres' })
  description: string;

}
