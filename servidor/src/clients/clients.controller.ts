import {
  Controller, Get, Post, Patch, Delete, Body, Param,
  UseGuards, UsePipes, BadRequestException,
} from '@nestjs/common';
import { ClientsService } from './clients.service.js';
import { CreateClientSchema, UpdateClientSchema, CreateClientDto, UpdateClientDto } from './dto/client.zod.js';
import { ZodValidationPipe } from '../common/pipes/zod.pipe.js';
import { AtGuard } from '../common/guards/at.guard.js';
import { PermissionsGuard } from '../common/guards/permissions.guard.js';
import { Permissions } from '../common/decorators/permissions.decorator.js';
import { PermissionSlug } from '../common/enums/rbac.enum.js';


@UseGuards(AtGuard, PermissionsGuard)
@Controller('clients')
export class ClientsController {
  constructor(private clientsService: ClientsService) { }

  @Get()
  @Permissions(PermissionSlug.VER_CLIENTES, PermissionSlug.CREAR_PROYECTOS, PermissionSlug.ACTUALIZAR_PROYECTOS)
  async findAll() {
    return this.clientsService.findAll();
  }

  @Get(':id')
  @Permissions(PermissionSlug.VER_CLIENTES, PermissionSlug.CREAR_PROYECTOS, PermissionSlug.ACTUALIZAR_PROYECTOS)
  async findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Post()
  @Permissions(PermissionSlug.CREAR_CLIENTES)
  async create(@Body(new ZodValidationPipe(CreateClientSchema)) dto: CreateClientDto) {
    return this.clientsService.create(dto);
  }

  @Patch(':id')
  @Permissions(PermissionSlug.ACTUALIZAR_CLIENTES)
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateClientSchema)) dto: UpdateClientDto,
  ) {
    return this.clientsService.update(id, dto);
  }

  @Delete(':id')
  @Permissions(PermissionSlug.ELIMINAR_CLIENTES)
  async remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }
}
