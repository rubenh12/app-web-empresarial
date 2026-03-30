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
import { PermissionSlug } from '../common/enums/rbac.enum.js';

@UseGuards(AtGuard, PermissionsGuard)
@Controller('tasks')
export class TasksController {
  constructor(private tasksService: TasksService) { }

  @Get()
  @Permissions(PermissionSlug.VER_TAREAS, PermissionSlug.VER_PROYECTOS, PermissionSlug.CREAR_PROYECTOS, PermissionSlug.ACTUALIZAR_PROYECTOS)
  async findAll(@Query('projectId') projectId?: string) {
    return this.tasksService.findAll(projectId);
  }

  @Get(':id')
  @Permissions(PermissionSlug.VER_TAREAS, PermissionSlug.VER_PROYECTOS, PermissionSlug.CREAR_PROYECTOS, PermissionSlug.ACTUALIZAR_PROYECTOS)
  async findOne(@Param('id') id: string) {
    return this.tasksService.findOne(id);
  }

  @Post()
  @Permissions(PermissionSlug.CREAR_TAREAS)
  async create(@Body(new ZodValidationPipe(CreateTaskSchema)) dto: CreateTaskDto) {
    return this.tasksService.create(dto);
  }

  @Patch(':id')
  @Permissions(PermissionSlug.ACTUALIZAR_TAREAS)
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateTaskSchema)) dto: UpdateTaskDto,
  ) {
    return this.tasksService.update(id, dto);
  }

  @Delete(':id')
  @Permissions(PermissionSlug.ELIMINAR_TAREAS)
  async remove(@Param('id') id: string) {
    return this.tasksService.remove(id);
  }
}
