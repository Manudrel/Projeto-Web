import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto.js';
import { ListEnrollmentsDto } from './dto/list-enrollments.dto.js';
import { UpdateEnrollmentDto } from './dto/update-enrollment.dto.js';
import { EnrollmentRepository } from './enrollment.repository.js';

@Injectable()
export class EnrollmentService {
  constructor(private readonly enrollmentRepository: EnrollmentRepository) {}

  findAll(filters: ListEnrollmentsDto) {
    return this.enrollmentRepository.findAll(filters);
  }

  async findById(id: number) {
    const enrollment = await this.enrollmentRepository.findById(id);

    if (!enrollment) {
      throw new NotFoundException('Matrícula não encontrada');
    }

    return enrollment;
  }

  create(data: CreateEnrollmentDto) {
    return this.enrollmentRepository.create(data);
  }

  async update(id: number, data: UpdateEnrollmentDto) {
    await this.findById(id);

    const enrollment = await this.enrollmentRepository.update(id, data);

    if (!enrollment) {
      throw new NotFoundException('Matrícula não encontrada');
    }

    return enrollment;
  }

  async delete(id: number): Promise<void> {
    await this.findById(id);
    await this.enrollmentRepository.delete(id);
  }
}
