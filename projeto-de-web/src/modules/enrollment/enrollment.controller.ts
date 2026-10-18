import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { ListEnrollmentsDto } from './dto/list-enrollments.dto.js';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto.js';
import { EnrollmentService } from './enrollment.service.js';

const idPipe = new ParseIntPipe({
  exceptionFactory: () => new BadRequestException('O id deve ser um número inteiro'),
});

@ApiTags('Matrículas')
@Controller('enrollments')
export class EnrollmentController {
  constructor(private readonly enrollmentService: EnrollmentService) {}

  @Get()
  @ApiOperation({ summary: 'Listar matrículas' })
  @ApiOkResponse({ description: 'Lista de matrículas' })
  @ApiBadRequestResponse({ description: 'Filtros inválidos' })
  findAll(@Query() filters: ListEnrollmentsDto) {
    return this.enrollmentService.findAll(filters);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar matrícula por id' })
  @ApiOkResponse({ description: 'Matrícula encontrada' })
  @ApiBadRequestResponse({ description: 'O id deve ser um número inteiro' })
  @ApiNotFoundResponse({ description: 'Matrícula não encontrada' })
  findById(@Param('id', idPipe) id: number) {
    return this.enrollmentService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Criar matrícula' })
  @ApiCreatedResponse({ description: 'Matrícula criada' })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  create(@Body() data: CreateEnrollmentDto) {
    return this.enrollmentService.create(data);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar matrícula' })
  @ApiOkResponse({ description: 'Matrícula atualizada' })
  @ApiBadRequestResponse({ description: 'Id ou dados inválidos' })
  @ApiNotFoundResponse({ description: 'Matrícula não encontrada' })
  update(
    @Param('id', idPipe) id: number,
    @Body() data: UpdateEnrollmentDto,
  ) {
    return this.enrollmentService.update(id, data);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Excluir matrícula' })
  @ApiNoContentResponse({ description: 'Matrícula excluída' })
  @ApiBadRequestResponse({ description: 'O id deve ser um número inteiro' })
  @ApiNotFoundResponse({ description: 'Matrícula não encontrada' })
  delete(@Param('id', idPipe) id: number) {
    return this.enrollmentService.delete(id);
  }
}
