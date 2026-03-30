import {
  Controller, Get, Post, Patch, Delete, Body, Param, Req,
  UseGuards, UsePipes, BadRequestException,
} from '@nestjs/common';
import { ProjectsService } from './projects.service.js';
import { CreateProjectSchema, UpdateProjectSchema, CreateProjectDto, UpdateProjectDto } from './dto/project.zod.js';
import { ZodValidationPipe } from '../common/pipes/zod.pipe.js';
import { AtGuard } from '../common/guards/at.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import { Permissions } from '../common/decorators/permissions.decorator.js';
import { PermissionSlug } from '../common/enums/rbac.enum.js';


@UseGuards(AtGuard, PermissionsGuard)
@Controller('projects')
export class ProjectsController {
  constructor(private projectsService: ProjectsService) { }

  @Get()
  @Permissions(PermissionSlug.VER_PROYECTOS, PermissionSlug.VER_PROYECTOS_ASIGNADOS, PermissionSlug.VER_TAREAS, PermissionSlug.CREAR_TAREAS, PermissionSlug.ACTUALIZAR_TAREAS)
  async findAll(@Req() req: any) {
    const { user } = req;

    // Si tiene permiso para ver todos, no filtramos por ID
    if (user.permissions.includes('ver:proyectos')) {
      return this.projectsService.findAll();
    }

    // Si solo tiene permiso para ver asignados, filtramos por su ID de usuario
    if (user.permissions.includes('ver:proyectos:asignados')) {
      return this.projectsService.findAll(user.sub);
    }

    return this.projectsService.findAll();
  }

  @Get(':id')
  @Permissions(PermissionSlug.VER_PROYECTOS, PermissionSlug.VER_TAREAS, PermissionSlug.CREAR_TAREAS, PermissionSlug.ACTUALIZAR_TAREAS)
  async findOne(@Param('id') id: string) {
    return this.projectsService.findOne(id);
  }

  @Post()
  @Permissions(PermissionSlug.CREAR_PROYECTOS)
  async create(@Body(new ZodValidationPipe(CreateProjectSchema)) dto: CreateProjectDto) {
    return this.projectsService.create(dto);
  }

  @Patch(':id')
  @Permissions(PermissionSlug.ACTUALIZAR_PROYECTOS)
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateProjectSchema)) dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, dto);
  }

  @Delete(':id')
  @Permissions(PermissionSlug.ELIMINAR_PROYECTOS)
  async remove(@Param('id') id: string) {
    return this.projectsService.remove(id);
  }
}
