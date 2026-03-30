import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.zod.js';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll(projectId?: string) {
    return this.prisma.client.task.findMany({
      where: projectId ? { projectId } : {},
      include: {
        project: true,
        assignedTo: {
          select: { id: true, name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.client.task.findUnique({
      where: { id },
      include: {
        project: true,
        assignedTo: {
          select: { id: true, name: true, email: true }
        }
      },
    });
    if (!task) throw new NotFoundException('Tarea no encontrada');
    return task;
  }

  async create(dto: CreateTaskDto) {
    return this.prisma.client.task.create({
      data: dto as any,
    });
  }

  async update(id: string, dto: UpdateTaskDto) {
    await this.findOne(id);
    return this.prisma.client.task.update({
      where: { id },
      data: dto as any,
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.client.task.delete({ where: { id } });
  }
}
