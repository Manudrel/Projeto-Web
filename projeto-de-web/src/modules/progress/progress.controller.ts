import { BadRequestException, Body, Controller, Get, Param, ParseIntPipe, Patch, Post, Query, } from '@nestjs/common';
import { CurrentUser } from '../../common/decorators/current-user.decorator.js';
import type { AuthenticatedUser } from '../auth/auth.types.js';
import { CreateProgressDto } from './dto/create-progress.dto.js';
import { ListProgressDto } from './dto/list-progress.dto.js';
import { UpdateProgressDto } from './dto/update-progress.dto.js';
import { ProgressService } from './progress.service.js';

const idPipe = new ParseIntPipe({
  exceptionFactory: () => new BadRequestException('O id deve ser um número'),
});

@Controller('progress')
export class ProgressController {
  constructor(private readonly progressService: ProgressService) { }

  @Get()
  findAll(@Query() filters: ListProgressDto, @CurrentUser() user: AuthenticatedUser) {
    return this.progressService.findAll(filters, user);
  }

  @Get(':id')
  findById(@Param('id', idPipe) id: number, @CurrentUser() user: AuthenticatedUser) {
    return this.progressService.findById(id, user);
  }

  @Post()
  create(@Body() data: CreateProgressDto, @CurrentUser() user: AuthenticatedUser) {
    return this.progressService.create(data, user);
  }

  @Patch(':id')
  update(
    @Param('id', idPipe) id: number,
    @Body() data: UpdateProgressDto,
    @CurrentUser() user: AuthenticatedUser,
  ) {
    return this.progressService.update(id, data, user);
  }
}
