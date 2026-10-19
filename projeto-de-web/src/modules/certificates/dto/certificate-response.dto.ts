import { ApiProperty } from '@nestjs/swagger';
import { CertificateStatus } from '../certificate.entity.js';

export class CertificateResponseDto {
  @ApiProperty({ example: 23 })
  id: number;

  @ApiProperty({ example: 15 })
  userId: number;

  @ApiProperty({ example: 4 })
  courseId: number;

  @ApiProperty({ example: 'CERT-7K2P-X9QM' })
  code: string;

  @ApiProperty({ enum: CertificateStatus, example: CertificateStatus.VALID })
  status: CertificateStatus;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-10-18T12:00:00.000Z',
  })
  issuedAt: string;
}

export class CertificatesPaginationMetaDto {
  @ApiProperty({ example: 45 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 5 })
  totalPages: number;
}

export class PaginatedCertificatesResponseDto {
  @ApiProperty({ type: [CertificateResponseDto] })
  data: CertificateResponseDto[];

  @ApiProperty({ type: CertificatesPaginationMetaDto })
  meta: CertificatesPaginationMetaDto;
}

export class VerifyCertificateResponseDto {
  @ApiProperty({ example: 'Ana Silva' })
  studentName: string;

  @ApiProperty({ example: 'NestJS do Zero' })
  courseTitle: string;

  @ApiProperty({
    type: String,
    format: 'date-time',
    example: '2026-10-18T12:00:00.000Z',
  })
  issuedAt: string;

  @ApiProperty({ enum: CertificateStatus, example: CertificateStatus.VALID })
  status: CertificateStatus;
}
