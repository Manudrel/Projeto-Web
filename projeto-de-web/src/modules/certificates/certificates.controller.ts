import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Post, Query, } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiCreatedResponse, ApiConflictResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse, ApiUnprocessableEntityResponse, } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import { Public } from '../../common/decorators/public.decorator.js';
import { RequirePermissions } from '../../common/decorators/require-permissions.decorator.js';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { CreateCertificateDto } from './dto/create-certificate.dto.js';
import { CertificateResponseDto, PaginatedCertificatesResponseDto, VerifyCertificateResponseDto, } from './dto/certificate-response.dto.js';
import { ListCertificatesDto } from './dto/list-certificates.dto.js';
import { CertificatesService } from './certificates.service.js';

const idPipe = new ParseIntPipe({
  exceptionFactory: () => new BadRequestException('O id deve ser um número inteiro'),
});

@ApiTags('Certificados')
@ApiBearerAuth()
@Controller()
export class CertificatesController {
  constructor(private readonly certificatesService: CertificatesService) {}

  @Get('certificates')
  @RequirePermissions('certificates:read')
  @ApiOperation({ summary: 'Listar certificados com paginação e filtros' })
  @ApiOkResponse({ type: PaginatedCertificatesResponseDto })
  @ApiBadRequestResponse({ description: 'Filtros inválidos' })
  @ApiForbiddenResponse({ description: 'Acesso permitido ao admin ou ao próprio aluno' })
  @ApiUnauthorizedResponse({ description: 'Access token inválido ou expirado' })
  findAll(@Query() filters: ListCertificatesDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.certificatesService.findAll(filters, actor);
  }

  @Get('certificates/verify/:code')
  @Public()
  @ApiOperation({ summary: 'Verificar publicamente um certificado pelo código' })
  @ApiOkResponse({ type: VerifyCertificateResponseDto })
  @ApiNotFoundResponse({ description: 'Código de certificado não encontrado' })
  verify(@Param('code') code: string) {
    return this.certificatesService.verify(code);
  }

  @Get('certificates/:id')
  @RequirePermissions('certificates:read')
  @ApiOperation({ summary: 'Buscar certificado por id' })
  @ApiOkResponse({ type: CertificateResponseDto })
  @ApiBadRequestResponse({ description: 'O id deve ser um número inteiro' })
  @ApiForbiddenResponse({ description: 'Acesso permitido ao admin ou ao próprio aluno' })
  @ApiNotFoundResponse({ description: 'Certificado não encontrado' })
  @ApiUnauthorizedResponse({ description: 'Access token inválido ou expirado' })
  findById(@Param('id', idPipe) id: number, @CurrentUser() actor: AuthenticatedUser) {
    return this.certificatesService.findById(id, actor);
  }

  @Post('certificates')
  @RequirePermissions('certificates:create')
  @ApiOperation({ summary: 'Emitir certificado para um aluno que concluiu o curso' })
  @ApiCreatedResponse({ type: CertificateResponseDto })
  @ApiBadRequestResponse({ description: 'Dados inválidos' })
  @ApiForbiddenResponse({ description: 'Apenas o admin pode emitir certificados' })
  @ApiNotFoundResponse({ description: 'Curso ou aluno não encontrado' })
  @ApiUnprocessableEntityResponse({ description: 'A matrícula não foi concluída ou falta aprovação na avaliação final' })
  @ApiConflictResponse({ description: 'Já existe certificado válido para o aluno e curso' })
  @ApiUnauthorizedResponse({ description: 'Access token inválido ou expirado' })
  create(@Body() data: CreateCertificateDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.certificatesService.create(data, actor);
  }

  @Get('users/:userId/certificates')
  @RequirePermissions('certificates:read')
  @ApiOperation({ summary: 'Listar certificados de um usuário' })
  @ApiOkResponse({ type: PaginatedCertificatesResponseDto })
  @ApiBadRequestResponse({ description: 'Id ou filtros inválidos' })
  @ApiForbiddenResponse({ description: 'Acesso permitido ao admin ou ao próprio aluno' })
  @ApiUnauthorizedResponse({ description: 'Access token inválido ou expirado' })
  findByUser(@Param('userId', idPipe) userId: number, @Query() filters: ListCertificatesDto, @CurrentUser() actor: AuthenticatedUser) {
    return this.certificatesService.findByUser(userId, filters, actor);
  }
}
