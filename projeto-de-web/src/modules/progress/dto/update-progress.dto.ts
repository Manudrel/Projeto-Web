import { IsBoolean } from 'class-validator';

export class UpdateProgressDto {
  @IsBoolean({ message: 'O campo completed deve ser verdadeiro ou falso' })
  completed: boolean;
}
