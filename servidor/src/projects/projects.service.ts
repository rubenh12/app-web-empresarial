import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.zod.js';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId?: string) {
    const where = userId ? {
      tasks: {
        some: { userId }
      }
    } : {};

    return this.prisma.client.project.findMany({
      where,
      include: { client: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.client.project.findUnique({
      where: { id },
      include: { client: true },
    });
    if (!project) throw new NotFoundException('Proyecto no encontrado');
    return project;
  }

  async create(dto: CreateProjectDto) {
    return this.prisma.client.project.create({
      data: dto as any,
    });
  }

  async update(id: string, dto: UpdateProjectDto) {
    await this.findOne(id);
    return this.prisma.client.project.update({
      where: { id },
      data: dto as any,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.client.project.delete({ where: { id } });
  }
}
