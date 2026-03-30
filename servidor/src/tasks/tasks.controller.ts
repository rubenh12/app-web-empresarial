import {
  Controller, Get, Post, Patch, Delete, Body, Param, Query,
  UseGuards, UsePipes, BadRequestException,
} from '@nestjs/common';
import { TasksService } from './tasks.service.js';
import { CreateTaskSchema, UpdateTaskSchema, CreateTaskDto, UpdateTaskDto } from './dto/task.zod.js';
import { ZodValidationPipe } from '../common/pipes/zod.pipe.js';
import { AtGuard } from '../common/guards/at.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import { Permissions } from '../common/decorators/permissions.decorator.js';

@UseGuards(AtGuard, PermissionsGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) {}

  @Get()
  @Permissions('ver:tareas')
  async findAll(@Query('projectId') projectId?: string) {
    return this.tasksService.findAll(projectId);
  }

  @Get(':id')
  @Permissions('ver:tareas')
  async findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Post()
  @Permissions('crear:tareas')
  async create(@Body(new ZodValidationPipe(CreateTaskSchema)) dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @Patch(':id')
  @Permissions('actualizar:tareas')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateTaskSchema)) dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('eliminar:tareas')
  async remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
