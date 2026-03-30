import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, UsePipes, BadRequestException,
} from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { CreateProjectSchema, UpdateProjectSchema, CreateProjectDto, UpdateProjectDto } from './dto/project.zod.js';
import { ZodValidationPipe } from '../common/pipes/zod.pipe.js';
import { AtGuard } from '../common/guards/at.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import { Permissions } from '../common/decorators/permissions.decorator.js';

@UseGuards(AtGuard, PermissionsGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) {}

  @Get()
  @Permissions('ver:proyectos')
  async findAll() {
    return this.projectsService.findAll();
  }

  @Get(':id')
  @Permissions('ver:proyectos')
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Post()
  @Permissions('crear:proyectos')
  async create(@Body(new ZodValidationPipe(CreateProjectSchema)) dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Patch(':id')
  @Permissions('actualizar:proyectos')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateProjectSchema)) dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('eliminar:proyectos')
  async remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
