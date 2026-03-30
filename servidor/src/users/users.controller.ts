import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, UsePipes, BadRequestException } from '@nestjs/common';
import { UsersService } from './users.service.js';
import { CreateUserSchema, UpdateUserSchema, CreateUserDto, UpdateUserDto } from './dto/user.zod.js';
import { ZodValidationPipe } from '../common/pipes/zod.pipe.js';
import { AtGuard } from '../common/guards/at.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import { Permissions } from '../common/decorators/permissions.decorator.js';

@UseGuards(AtGuard, PermissionsGuard)
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) { }

  @Get()
  @Permissions('ver:usuarios', 'ver:tareas', 'crear:tareas', 'actualizar:tareas')
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('roles')
  @Permissions('ver:usuarios', 'crear:usuarios', 'actualizar:usuarios')
  async findAllRoles() {
    return this.usersService.findAllRoles();
  }

  @Get(':id')
  @Permissions('ver:usuarios', 'ver:tareas', 'crear:tareas', 'actualizar:tareas')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Post()
  @Permissions('crear:usuarios')
  @UsePipes(new ZodValidationPipe(CreateUserSchema))
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Patch(':id')
  @Permissions('actualizar:usuarios')
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
  @Permissions('eliminar:usuarios')
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
