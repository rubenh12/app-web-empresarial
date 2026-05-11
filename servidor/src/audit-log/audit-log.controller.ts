import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditLogService } from './audit-log.service.js';
import { AtGuard } from '../common/guards/at.guard.js';

@Controller('audit-log')
@UseGuards(AtGuard)
export class AuditLogController {
  constructor(private readonly auditLogService: AuditLogService) {}

  @Get()
  findAll(
    @Query('projectId') projectId?: string,
    @Query('entityId') entityId?: string,
  ) {
    return this.auditLogService.findAll(projectId, entityId);
  }
}
