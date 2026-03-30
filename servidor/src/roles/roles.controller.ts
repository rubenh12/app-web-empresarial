import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, UsePipes, BadRequestException,
} from '@nestjs/common';
import { RolesService } from './roles.service.js';
import { CreateRoleSchema, UpdateRoleSchema } from './dto/role.zod.js';
import type { CreateRoleDto, UpdateRoleDto } from './dto/role.zod.js';
import { ZodValidationPipe } from '../common/pipes/zod.pipe.js';
import { AtGuard } from '../common/guards/at.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import { Permissions } from '../common/decorators/permissions.decorator.js';

@UseGuards(AtGuard, PermissionsGuard)
@Controller('roles')
export class RolesController {
  constructor(private rolesService: RolesService) {}

  @Get()
  @Permissions('ver:usuarios')
  async findAll() {
    return this.rolesService.findAll();
  }

  @Get('permissions')
  @Permissions('ver:usuarios', 'crear:usuarios', 'actualizar:usuarios')
  async findAllPermissions() {
    return this.rolesService.findAllPermissions();
  }

  @Get(':id')
  @Permissions('ver:usuarios')
  async findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @Permissions('crear:usuarios')
  async create(@Body(new ZodValidationPipe(CreateRoleSchema)) dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Patch(':id')
  @Permissions('actualizar:usuarios')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateRoleSchema)) dto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('eliminar:usuarios')
  async remove(@Param('id') id: string) {
    return this.rolesService.remove(id);
  }
}
