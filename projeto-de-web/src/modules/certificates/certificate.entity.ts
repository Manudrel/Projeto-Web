export enum CertificateStatus {
  VALID = 'VALID',
  REVOKED = 'REVOKED',
}

export interface Certificate {
  id: number;
  userId: number;
  courseId: number;
  code: string;
  status: CertificateStatus;
  issuedAt: Date;
}
