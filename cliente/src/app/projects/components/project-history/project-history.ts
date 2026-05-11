import { Component, Input, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuditLogService, AuditLog } from '../../../core/services/audit-log.service';

@Component({
  selector: 'app-project-history',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-4">
      <div *ngIf="isLoading()" class="text-center py-8">
        <div class="text-slate-400">Cargando historial...</div>
      </div>

      <div *ngIf="!isLoading() && logs().length === 0" class="text-center py-8 text-slate-400">
        No hay registros en el historial para este proyecto.
      </div>

      <div *ngIf="!isLoading() && logs().length > 0" class="flow-root">
        <ul role="list" class="-mb-8">
          <li *ngFor="let log of logs(); let last = last">
            <div class="relative pb-8">
              <span *ngIf="!last" class="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true"></span>
              <div class="relative flex space-x-3">
                <div>
                  <span 
                    class="h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white"
                    [ngClass]="getActionClasses(log.action)"
                  >
                    <svg class="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path *ngIf="log.action === 'CREATE'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      <path *ngIf="log.action === 'UPDATE'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      <path *ngIf="log.action === 'DELETE'" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </span>
                </div>
                <div class="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5">
                  <div>
                    <p class="text-sm text-gray-500">
                      <span class="font-medium text-gray-900">{{ log.userName }}</span> 
                      {{ getActionText(log) }}
                      <span class="font-medium text-gray-900">{{ log.entityName }}</span>
                    </p>
                    <div *ngIf="log.action === 'UPDATE' && log.previousData && log.newData" class="mt-2 text-xs bg-gray-50 p-2 rounded border border-gray-100">
                      <div *ngFor="let diff of getDifferences(log.previousData, log.newData)">
                        <span class="font-bold capitalize">{{ diff.key }}:</span> 
                        <span class="text-red-500 line-through mr-1">{{ formatValue(diff.old) }}</span>
                        <span class="text-green-600 font-medium">{{ formatValue(diff.new) }}</span>
                      </div>
                    </div>
                  </div>
                  <div class="whitespace-nowrap text-right text-sm text-gray-500">
                    <time [dateTime]="log.createdAt">{{ log.createdAt | date:'dd MMM, HH:mm' }}</time>
                  </div>
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  `,
  styles: []
})
export class ProjectHistoryComponent implements OnInit {
  @Input() projectId?: string;
  @Input() entityId?: string;
  
  logs = signal<AuditLog[]>([]);
  isLoading = signal(true);

  constructor(private auditLogService: AuditLogService) {}

  ngOnInit() {
    this.loadHistory();
  }

  loadHistory() {
    this.isLoading.set(true);
    this.auditLogService.findAll(this.projectId, this.entityId).subscribe({
      next: (data) => {
        this.logs.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getActionClasses(action: string): string {
    switch (action) {
      case 'CREATE': return 'bg-green-500';
      case 'UPDATE': return 'bg-blue-500';
      case 'DELETE': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  }

  getActionText(log: AuditLog): string {
    const type = log.entityType === 'Project' ? 'el proyecto' : 'la tarea';
    switch (log.action) {
      case 'CREATE': return `creó ${type}`;
      case 'UPDATE': return `actualizó ${type}`;
      case 'DELETE': return `eliminó ${type}`;
      default: return `realizó una acción en ${type}`;
    }
  }

  getDifferences(oldData: any, newData: any): any[] {
    const diffs = [];
    const ignore = ['updatedAt', 'createdAt', 'id', 'userId', 'projectId'];
    
    for (const key in newData) {
      if (ignore.includes(key)) continue;
      
      if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        diffs.push({
          key,
          old: oldData[key],
          new: newData[key]
        });
      }
    }
    return diffs;
  }

  formatValue(val: any): string {
    if (val === null || val === undefined) return 'vacio';
    if (typeof val === 'boolean') return val ? 'Si' : 'No';
    if (typeof val === 'object') return '...';
    return String(val);
  }
}
