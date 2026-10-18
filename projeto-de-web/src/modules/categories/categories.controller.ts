import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Param, ParseIntPipe, Patch, Post, Query, } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, } from '@nestjs/swagger';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator.js';
import { CategoriesService } from './categories.service.js';
import { CreateCategoryDto } from './dto/create-category.dto.js';
import { UpdateCategoryDto } from './dto/update-category.dto.js';
import { ListCategoriesDto } from './dto/list-categories.dto.js';

const idPipe = new ParseIntPipe({
  exceptionFactory: () => new BadRequestException('O id deve ser um número'),
});

@ApiTags('Categorias')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Get()
  @RequirePermissions('categories:read')
  @ApiOperation({ summary: 'Listar categorias' })
  @ApiOkResponse({ description: 'Lista de categorias paginada' })
  @ApiBadRequestResponse({ description: 'Filtros inválidos' })
  findAll(@Query() filters: ListCategoriesDto) {
    return this.categoriesService.findAll(filters);
  }

  @Get(':id')
  @RequirePermissions('categories:read')
  @ApiOperation({ summary: 'Buscar categoria por id' })
  @ApiOkResponse({ description: 'Categoria encontrada com sucesso' })
  @ApiNotFoundResponse({ description: 'Categoria não encontrada' })
  @ApiBadRequestResponse({ description: 'Id inválido' })
  findById(@Param('id', idPipe) id: number) {
    return this.categoriesService.findById(id);
  }

  @Post()
  @RequirePermissions('categories:create')
  @ApiOperation({ summary: 'Criar categoria' })
  @ApiCreatedResponse({ description: 'Categoria criada com sucesso' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiConflictResponse({ description: 'Já existe uma categoria com esse nome' })
  create(@Body() data: CreateCategoryDto) {
    return this.categoriesService.create(data);
  }

  @Patch(':id')
  @RequirePermissions('categories:update')
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
  @RequirePermissions('categories:delete')
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
