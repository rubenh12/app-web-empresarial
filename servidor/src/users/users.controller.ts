import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, UsePipes, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserSchema, UpdateUserSchema, CreateUserDto, UpdateUserDto } from './dto/user.zod.js';
import { ZodValidationPipe } from '../common/pipes/zod.pipe.js';
import { AtGuard } from '../common/guards/at.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import { Permissions } from '../common/decorators/permissions.decorator.js';
import { PermissionSlug } from '../common/enums/rbac.enum.js';

@UseGuards(AtGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  @Get()
  @Permissions(PermissionSlug.VER_USUARIOS, PermissionSlug.VER_TAREAS, PermissionSlug.CREAR_TAREAS, PermissionSlug.ACTUALIZAR_TAREAS)
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('roles')
  @Permissions(PermissionSlug.VER_USUARIOS, PermissionSlug.CREAR_USUARIOS, PermissionSlug.ACTUALIZAR_USUARIOS)
  async findAllRoles() {
    return this.usersService.findAllRoles();
  }

  @Get(':id')
  @Permissions(PermissionSlug.VER_USUARIOS, PermissionSlug.VER_TAREAS, PermissionSlug.CREAR_TAREAS, PermissionSlug.ACTUALIZAR_TAREAS)
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Permissions(PermissionSlug.CREAR_USUARIOS)
  @UsePipes(new ZodValidationPipe(CreateUserSchema))
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @Permissions(PermissionSlug.ACTUALIZAR_USUARIOS)
  async update(@Param('id') id: string, @Body() body: any) {
    let data = body;

    if (typeof body === 'string') {
      try {
        data = JSON.parse(body);
      } catch (e) {
        throw new BadRequestException('Invalid JSON body');
      }
    }

    try {
      const validated = UpdateUserSchema.parse(data);
      return this.usersService.update(id, validated);
    } catch (error: any) {
      throw new BadRequestException(error.errors || 'Validation failed');
    }
  }

  @Delete(':id')
  @Permissions(PermissionSlug.ELIMINAR_USUARIOS)
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
