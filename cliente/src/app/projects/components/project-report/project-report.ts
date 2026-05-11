import { Component, Input, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksService, Task } from '../../../core/services/tasks.service';
import { Project } from '../../../core/services/projects.service';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-project-report',
  standalone: true,
  imports: [CommonModule],
  providers: [DatePipe],
  template: `
    <div class="p-6">
      <div *ngIf="isLoading()" class="text-center py-8">
        <div class="text-slate-400">Generando reporte...</div>
      </div>

      <div *ngIf="!isLoading()" class="space-y-8">
        <div class="flex justify-end">
          <button 
            (click)="exportToPDF()"
            class="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-xl hover:bg-slate-700 transition-colors text-sm font-bold shadow-sm"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
            Exportar PDF
          </button>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div class="bg-blue-50 border border-blue-100 p-4 rounded-2xl">
            <div class="text-blue-600 text-xs font-bold uppercase tracking-wider mb-1">Total Tareas</div>
            <div class="text-3xl font-black text-blue-900">{{ tasks().length }}</div>
          </div>
          <div class="bg-green-50 border border-green-100 p-4 rounded-2xl">
            <div class="text-green-600 text-xs font-bold uppercase tracking-wider mb-1">Completadas</div>
            <div class="text-3xl font-black text-green-900">{{ completedCount() }}</div>
          </div>
          <div class="bg-orange-50 border border-orange-100 p-4 rounded-2xl">
            <div class="text-orange-600 text-xs font-bold uppercase tracking-wider mb-1">Pendientes</div>
            <div class="text-3xl font-black text-orange-900">{{ pendingCount() }}</div>
          </div>
          <div class="bg-purple-50 border border-purple-100 p-4 rounded-2xl">
            <div class="text-purple-600 text-xs font-bold uppercase tracking-wider mb-1">Progreso</div>
            <div class="text-3xl font-black text-purple-900">{{ completionRate() }}%</div>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
          <div class="flex justify-between items-end mb-4">
            <div>
              <h3 class="text-lg font-bold text-slate-800">Estado de Avance</h3>
              <p class="text-xs text-slate-400">Distribución de tareas por estado</p>
            </div>
            <div class="text-right">
              <span class="text-2xl font-black text-slate-800">{{ completionRate() }}%</span>
              <span class="text-[10px] block text-slate-400 uppercase font-bold tracking-tighter">Completado</span>
            </div>
          </div>
          <div class="h-4 w-full bg-slate-100 rounded-full flex overflow-hidden">
            <div [style.width.%]="completionRate()" class="bg-green-500 h-full transition-all duration-1000"></div>
            <div [style.width.%]="inProgressRate()" class="bg-blue-500 h-full transition-all duration-1000"></div>
          </div>
        </div>

        <!-- Task List Analysis -->
        <div class="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-hidden">
          <div class="p-6 border-b border-slate-50">
            <h3 class="font-bold text-slate-800">Desglose de Actividades</h3>
          </div>
          <table class="w-full text-left">
            <thead class="bg-slate-50 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
              <tr>
                <th class="px-6 py-3">Responsable</th>
                <th class="px-6 py-3">Tarea</th>
                <th class="px-6 py-3">Prioridad</th>
                <th class="px-6 py-3">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-50">
              <tr *ngFor="let t of tasks()" class="text-sm hover:bg-slate-50 transition-colors">
                <td class="px-6 py-4">
                  <div class="flex items-center gap-2">
                    <div class="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-500">
                      {{ t.assignedTo?.name?.charAt(0) }}
                    </div>
                    <span class="text-slate-600">{{ t.assignedTo?.name }}</span>
                  </div>
                </td>
                <td class="px-6 py-4 font-medium text-slate-800">{{ t.title }}</td>
                <td class="px-6 py-4">
                   <span [ngClass]="getPriorityClasses(t.priority)" class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                    {{ t.priority }}
                  </span>
                </td>
                <td class="px-6 py-4">
                   <span [ngClass]="getStatusClasses(t.status)" class="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">
                    {{ t.status }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class ProjectReportComponent implements OnInit {
  @Input() projectId!: string;
  
  tasks = signal<Task[]>([]);
  isLoading = signal(true);

  completedCount = computed(() => this.tasks().filter(t => t.status === 'completado').length);
  pendingCount = computed(() => this.tasks().filter(t => t.status === 'pendiente').length);
  inProgressCount = computed(() => this.tasks().filter(t => t.status === 'en_progreso').length);
  
  completionRate = computed(() => {
    if (this.tasks().length === 0) return 0;
    return Math.round((this.completedCount() / this.tasks().length) * 100);
  });

  inProgressRate = computed(() => {
    if (this.tasks().length === 0) return 0;
    return Math.round((this.inProgressCount() / this.tasks().length) * 100);
  });

  constructor(
    private tasksService: TasksService,
    private datePipe: DatePipe
  ) {}

  ngOnInit() {
    this.loadTasks();
  }

  loadTasks() {
    this.isLoading.set(true);
    this.tasksService.findAll(this.projectId).subscribe({
      next: (data) => {
        this.tasks.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getPriorityClasses(priority: string): string {
    const map: any = {
      'alta': 'bg-red-100 text-red-700',
      'media': 'bg-orange-100 text-orange-700',
      'baja': 'bg-blue-100 text-blue-700'
    };
    return map[priority] || 'bg-gray-100';
  }

  getStatusClasses(status: string): string {
    const map: any = {
      'pendiente': 'bg-slate-100 text-slate-400',
      'en_progreso': 'bg-blue-100 text-blue-600',
      'completado': 'bg-green-100 text-green-600',
      'bloqueado': 'bg-red-100 text-red-500'
    };
    return map[status] || 'bg-gray-100';
  }

  exportToPDF() {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    doc.setFontSize(22);
    doc.setTextColor(30, 41, 59);
    doc.text('Reporte de Proyecto', 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Generado el: ${this.datePipe.transform(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 28);
    
    doc.setDrawColor(226, 232, 240);
    doc.line(14, 35, pageWidth - 14, 35);
    
    doc.setFontSize(14);
    doc.setTextColor(30, 41, 59);
    doc.text('Resumen Ejecutivo', 14, 45);
    
    const summaryData = [
      ['Total de Tareas', this.tasks().length.toString()],
      ['Tareas Completadas', this.completedCount().toString()],
      ['Tareas Pendientes', this.pendingCount().toString()],
      ['Porcentaje de Avance', `${this.completionRate()}%`]
    ];
    
    autoTable(doc, {
      startY: 50,
      head: [['Métrica', 'Valor']],
      body: summaryData,
      theme: 'striped',
      headStyles: { fillColor: [30, 41, 59] },
    });
    
    doc.setFontSize(14);
    doc.text('Detalle de Tareas', 14, (doc as any).lastAutoTable.finalY + 15);
    
    const taskData = this.tasks().map(t => [
      t.title,
      t.assignedTo?.name || 'No asignado',
      t.priority.toUpperCase(),
      t.status.replace('_', ' ').toUpperCase(),
      this.datePipe.transform(t.startDate, 'dd/MM/yyyy') || 'N/A'
    ]);
    
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Tarea', 'Responsable', 'Prioridad', 'Estado', 'Inicio']],
      body: taskData,
      headStyles: { fillColor: [30, 41, 59] },
      styles: { fontSize: 9 }
    });
    
    doc.save(`Reporte_Proyecto_${this.projectId}.pdf`);
  }
}
