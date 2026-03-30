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

@UseGuards(AtGuard, PermissionsGuard)
@Controller('clients')
export class ClientsController {
  constructor(private clientsService: ClientsService) {}

  @Get()
  @Permissions('ver:clientes')
  async findAll() {
    return this.clientsService.findAll();
  }

  @Get(':id')
  @Permissions('ver:clientes')
  async findOne(@Param('id') id: string) {
    return this.clientsService.findOne(id);
  }

  @Post()
  @Permissions('crear:clientes')
  async create(@Body(new ZodValidationPipe(CreateClientSchema)) dto: CreateClientDto) {
    return this.clientsService.create(dto);
  }

  @Patch(':id')
  @Permissions('actualizar:clientes')
  async update(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateClientSchema)) dto: UpdateClientDto,
  ) {
    return this.clientsService.update(id, dto);
  }

  @Delete(':id')
  @Permissions('eliminar:clientes')
  async remove(@Param('id') id: string) {
    return this.clientsService.remove(id);
  }
}
