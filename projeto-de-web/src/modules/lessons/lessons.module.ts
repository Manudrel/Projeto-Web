import { Module } from '@nestjs/common';
import knex from 'knex';
import { LessonsController } from './lessons.controller.js';
import { LessonsRepository } from './lessons.repository.js';
import { LessonsService } from './lessons.service.js';

@Module({
  controllers: [LessonsController],
  providers: [
    LessonsService,
    LessonsRepository,
  ],
})
export class LessonsModule {}