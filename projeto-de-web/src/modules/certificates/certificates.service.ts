import { ConflictException, ForbiddenException, Injectable, NotFoundException, UnprocessableEntityException, } from '@nestjs/common';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { CertificateStatus } from './certificate.entity.js';
import { CertificatesRepository } from './certificates.repository.js';
import { CreateCertificateDto } from './dto/create-certificate.dto.js';
import { ListCertificatesDto } from './dto/list-certificates.dto.js';

@Injectable()
export class CertificatesService {
  constructor(private readonly certificatesRepository: CertificatesRepository) {}

  findAll(filters: ListCertificatesDto, actor: AuthenticatedUser) {
    if (actor.profile.role === 'STUDENT') {
      filters.userId = actor.id;
    } else if (actor.profile.role !== 'ADMIN') {
      throw new ForbiddenException('Apenas o admin ou o próprio aluno pode consultar certificados');
    }

    return this.certificatesRepository.findAll(filters);
  }

  async findById(id: number, actor: AuthenticatedUser) {
    const certificate = await this.certificatesRepository.findById(id);
    if (!certificate) throw new NotFoundException('Certificado não encontrado');
    this.ensureCanRead(certificate.userId, actor);
    return certificate;
  }

  async findByUser(userId: number, filters: ListCertificatesDto, actor: AuthenticatedUser,) {
    this.ensureCanRead(userId, actor);
    filters.userId = userId;
    return this.certificatesRepository.findAll(filters);
  }

  async create(data: CreateCertificateDto, actor: AuthenticatedUser) {
    if (actor.profile.role !== 'ADMIN') {
      throw new ForbiddenException('Apenas o admin pode emitir certificados');
    }

    const [user, course, enrollment] = await Promise.all([
      this.certificatesRepository.findUser(data.userId),
      this.certificatesRepository.findCourse(data.courseId),
      this.certificatesRepository.findCompletedEnrollment(data.userId, data.courseId),
    ]);

    if (!user) throw new NotFoundException('Aluno não encontrado');
    if (!course) throw new NotFoundException('Curso não encontrado');
    if (!enrollment) {
      throw new UnprocessableEntityException('O aluno precisa ter uma matrícula concluída com 100% de progresso');
    }

    const hasFinalAssessment = await this.certificatesRepository.hasFinalAssessment(data.courseId);
    if (
      hasFinalAssessment &&
      !(await this.certificatesRepository.hasApprovedFinalAttempt(data.userId, data.courseId))
    ) {
      throw new UnprocessableEntityException('O aluno precisa ser aprovado na avaliação final para receber o certificado');
    }

    if (await this.certificatesRepository.hasValidCertificate(data.userId, data.courseId)) {
      throw new ConflictException('Já existe um certificado válido para este aluno e curso');
    }

    try {
      return await this.certificatesRepository.create(data.userId, data.courseId);
    } catch (error) {
      if (this.certificatesRepository.isUniqueViolation(error)) {
        throw new ConflictException('Já existe um certificado válido para este aluno e curso');
      }
      throw error;
    }
  }

  async verify(code: string) {
    const certificate = await this.certificatesRepository.findByCode(code);
    if (!certificate) throw new NotFoundException('Certificado não encontrado');

    const status =
      certificate.status === CertificateStatus.VALID &&
      certificate.userStatus === 'ACTIVE' &&
      certificate.hasCompletedEnrollment
        ? CertificateStatus.VALID
        : CertificateStatus.REVOKED;

    return {
      studentName: certificate.studentName,
      courseTitle: certificate.courseTitle,
      issuedAt: certificate.issuedAt,
      status,
    };
  }

  private ensureCanRead(ownerId: number, actor: AuthenticatedUser) {
    if (actor.profile.role !== 'ADMIN' && !(actor.profile.role === 'STUDENT' && actor.id === ownerId)) {
      throw new ForbiddenException('Você não tem acesso a este certificado');
    }
  }
}
