import { Module } from '@nestjs/common';
import { ProgressController } from './progress.controller.js';
import { ProgressRepository } from './progress.repository.js';
import { ProgressService } from './progress.service.js';

@Module({
  controllers: [ProgressController],
  providers: [ProgressService, ProgressRepository],
})
export class ProgressModule { }
