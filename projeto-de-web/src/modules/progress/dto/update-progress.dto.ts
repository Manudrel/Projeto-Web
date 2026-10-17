import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateProgressDto {
  @ApiProperty({
    description: 'Status de conclusão da aula (true = concluída, false = pendente)',
    example: true,
  })
  @IsBoolean({ message: 'O campo completed deve ser verdadeiro ou falso' })
  completed: boolean;
}
