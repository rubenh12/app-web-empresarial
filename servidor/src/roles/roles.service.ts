import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateRoleDto, UpdateRoleDto } from './dto/role.zod.js';

@Injectable()
export class RolesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.client.role.findMany({
      include: { permissions: true },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.client.role.findUnique({
      where: { id },
      include: { permissions: true },
    });
    if (!role) throw new NotFoundException('Rol no encontrado');
    return role;
  }

  async create(dto: CreateRoleDto) {
    const exists = await this.prisma.client.role.findUnique({
      where: { name: dto.name },
    });
    if (exists) throw new ConflictException('El nombre del rol ya existe');

    const { permissionSlugs, ...data } = dto;

    return this.prisma.client.role.create({
      data: {
        ...data,
        permissions: {
          connect: permissionSlugs?.map(slug => ({ slug })) || [],
        },
      },
      include: { permissions: true },
    });
  }

  async update(id: string, dto: UpdateRoleDto) {
    await this.findOne(id);
    
    if (dto.name) {
      const exists = await this.prisma.client.role.findUnique({
        where: { name: dto.name },
      });
      if (exists && exists.id !== id)
        throw new ConflictException('El nombre del rol ya existe');
    }

    const { permissionSlugs, ...data } = dto;

    return this.prisma.client.role.update({
      where: { id },
      data: {
        ...data,
        permissions: permissionSlugs ? {
          set: permissionSlugs.map(slug => ({ slug })),
        } : undefined,
      },
      include: { permissions: true },
    });
  }

  async remove(id: string) {
    const role = await this.findOne(id);
    
    
    if (role.name === 'ADMIN') {
      throw new ConflictException('No se puede eliminar el rol de administrador');
    }

    return this.prisma.client.role.delete({ where: { id } });
  }

  async findAllPermissions() {
    return this.prisma.client.permission.findMany({
      orderBy: { name: 'asc' },
    });
  }
}
