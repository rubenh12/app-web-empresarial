import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { CreateProjectDto, UpdateProjectDto } from './dto/project.zod.js';
import { AuditLogService } from '../audit-log/audit-log.service.js';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

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

  async create(dto: CreateProjectDto, user: any) {
    const project = await this.prisma.client.project.create({
      data: dto as any,
    });

    await this.auditLog.createLog({
      entityType: 'Project',
      entityId: project.id,
      entityName: project.name,
      action: 'CREATE',
      newData: project,
      userId: user.sub,
      userName: user.name || user.email,
      projectId: project.id,
    });

    return project;
  }

  async update(id: string, dto: UpdateProjectDto, user: any) {
    const previousProject = await this.findOne(id);
    const updatedProject = await this.prisma.client.project.update({
      where: { id },
      data: dto as any,
    });

    await this.auditLog.createLog({
      entityType: 'Project',
      entityId: id,
      entityName: updatedProject.name,
      action: 'UPDATE',
      previousData: previousProject,
      newData: updatedProject,
      userId: user.sub,
      userName: user.name || user.email,
      projectId: id,
    });

    return updatedProject;
  }

  async remove(id: string, user: any) {
    const project = await this.findOne(id);
    const result = await this.prisma.client.project.delete({ where: { id } });

    await this.auditLog.createLog({
      entityType: 'Project',
      entityId: id,
      entityName: project.name,
      action: 'DELETE',
      previousData: project,
      userId: user.sub,
      userName: user.name || user.email,
      projectId: id,
    });

    return result;
  }
}
