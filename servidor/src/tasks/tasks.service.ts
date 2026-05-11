import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateTaskDto, UpdateTaskDto } from './dto/task.zod.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';

@Injectable()
export class TasksService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

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

  async create(dto: CreateTaskDto, user: any) {
    const task = await this.prisma.client.task.create({
      data: dto as any,
    });

    await this.auditLog.createLog({
      entityType: 'Task',
      entityId: task.id,
      entityName: task.title,
      action: 'CREATE',
      newData: task,
      userId: user.sub,
      userName: user.name || user.email,
      projectId: task.projectId,
    });

    return task;
  }

  async update(id: string, dto: UpdateTaskDto, user: any) {
    const previousTask = await this.findOne(id);
    const updatedTask = await this.prisma.client.task.update({
      where: { id },
      data: dto as any,
    });

    await this.auditLog.createLog({
      entityType: 'Task',
      entityId: id,
      entityName: updatedTask.title,
      action: 'UPDATE',
      previousData: previousTask,
      newData: updatedTask,
      userId: user.sub,
      userName: user.name || user.email,
      projectId: updatedTask.projectId,
    });

    return updatedTask;
  }

  async remove(id: string, user: any) {
    const task = await this.findOne(id);
    const result = await this.prisma.client.task.delete({ where: { id } });

    await this.auditLog.createLog({
      entityType: 'Task',
      entityId: id,
      entityName: task.title,
      action: 'DELETE',
      previousData: task,
      userId: user.sub,
      userName: user.name || user.email,
      projectId: task.projectId,
    });

    return result;
  }
}
