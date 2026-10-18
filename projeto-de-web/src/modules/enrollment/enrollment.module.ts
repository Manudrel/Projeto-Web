import { Module } from '@nestjs/common';
import knex from 'knex';
import { EnrollmentRepository } from './enrollment.repository.js';
import { EnrollmentService } from './enrollment.service.js';
import {  EnrollmentController } from './enrollment.controller.js';

@Module({
  controllers: [EnrollmentController],
  providers: [
    EnrollmentService,
    EnrollmentRepository,
  ],
})
export class EnrollmentModule {}