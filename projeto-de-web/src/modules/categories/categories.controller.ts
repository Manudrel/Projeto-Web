import { BadRequestException, Body, Controller, Delete, HttpCode, Param, ParseIntPipe, Patch, Post, } from '@nestjs/common';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';

const idPipe = new ParseIntPipe({
  exceptionFactory: () => new BadRequestException('O id deve ser um número'),
});

@ApiTags('Categorias')
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Post()
  @ApiOperation({ summary: 'Criar categoria' })
  @ApiCreatedResponse({ description: 'Categoria criada com sucesso' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiConflictResponse({ description: 'Já existe uma categoria com esse nome' })
  create(@Body() data: CreateCategoryDto) {
    return this.categoriesService.create(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar categoria' })
  @ApiOkResponse({ description: 'Categoria atualizada com sucesso' })
  @ApiBadRequestResponse({
    description: 'Dados inválidos, id inválido ou categoria com cursos publicados',
  })
  @ApiNotFoundResponse({ description: 'Categoria não encontrada' })
  @ApiConflictResponse({ description: 'Já existe uma categoria com esse nome' })
  update(@Param('id', idPipe) id: number, @Body() data: UpdateCategoryDto) {
    return this.categoriesService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Excluir categoria' })
  @ApiNoContentResponse({ description: 'Categoria excluída com sucesso' })
  @ApiBadRequestResponse({
    description: 'Id inválido ou categoria com cursos publicados',
  })
  @ApiNotFoundResponse({ description: 'Categoria não encontrada' })
  delete(@Param('id', idPipe) id: number) {
    return this.categoriesService.delete(id);
  }
}
