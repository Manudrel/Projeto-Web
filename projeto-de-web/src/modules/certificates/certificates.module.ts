import { Module } from '@nestjs/common';
import { CertificatesController } from './certificates.controller.js';
import { CertificatesRepository } from './certificates.repository.js';
import { CertificatesService } from './certificates.service.js';

@Module({
  controllers: [CertificatesController],
  providers: [CertificatesService, CertificatesRepository],
})
export class CertificatesModule {}
