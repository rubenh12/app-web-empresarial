import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class AuditLogService {
  constructor(private prisma: PrismaService) {}

  async createLog(data: {
    entityType: string;
    entityId: string;
    entityName: string;
    action: string;
    previousData?: any;
    newData?: any;
    userId: string;
    userName: string;
    projectId?: string;
  }) {
    try {
      return await (this.prisma.client as any).auditLog.create({
        data: {
          ...data,
          previousData: data.previousData ? JSON.parse(JSON.stringify(data.previousData)) : null,
          newData: data.newData ? JSON.parse(JSON.stringify(data.newData)) : null,
        },
      });
    } catch (error) {
    }
  }

  async findAll(projectId?: string, entityId?: string) {
    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (entityId) where.entityId = entityId;

    return (this.prisma.client as any).auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }
}
