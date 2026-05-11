import { Component, Input, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksService, Task } from '../../../core/services/tasks.service';
import { ProjectsService, Project } from '../../../core/services/projects.service';

@Component({
  selector: 'app-project-gantt',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="p-6 overflow-x-auto">
      <div *ngIf="isLoading()" class="text-center py-8">
        <div class="text-slate-400">Cargando cronograma...</div>
      </div>

      <div *ngIf="!isLoading() && tasks().length === 0" class="text-center py-8 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
        No hay tareas programadas para este proyecto.
      </div>

      <div *ngIf="!isLoading() && tasks().length > 0" class="min-w-[800px]">
        <!-- Timeline Header -->
        <div class="flex mb-4 border-b border-slate-100 pb-2">
          <div class="w-1/4 font-bold text-slate-500 text-xs uppercase tracking-wider">Tarea</div>
          <div class="w-3/4 flex relative">
            <div *ngFor="let m of timelineMonths()" class="flex-1 text-center text-[10px] font-bold text-slate-400 border-l border-slate-50">
              {{ m }}
            </div>
          </div>
        </div>

        <!-- Task Rows -->
        <div class="space-y-3">
          <div *ngFor="let task of tasks()" class="flex items-center group">
            <div class="w-1/4 pr-4">
              <div class="text-sm font-semibold text-slate-700 truncate" [title]="task.title">{{ task.title }}</div>
              <div class="text-[10px] text-slate-400">{{ task.status | titlecase }}</div>
            </div>
            <div class="w-3/4 h-8 bg-slate-50 rounded-lg relative overflow-hidden">
              <!-- Task Bar -->
              <div 
                class="absolute h-full rounded-lg shadow-sm transition-all duration-500"
                [ngClass]="getStatusColor(task.status)"
                [style.left.%]="getTaskStartOffset(task)"
                [style.width.%]="getTaskWidth(task)"
              >
              </div>
            </div>
          </div>
        </div>

        <!-- Legend -->
        <div class="mt-8 flex gap-6 justify-center">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded bg-slate-400"></div>
            <span class="text-[10px] font-medium text-slate-500 uppercase">Pendiente</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded bg-blue-500"></div>
            <span class="text-[10px] font-medium text-slate-500 uppercase">En Progreso</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded bg-green-500"></div>
            <span class="text-[10px] font-medium text-slate-500 uppercase">Completado</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded bg-red-400"></div>
            <span class="text-[10px] font-medium text-slate-500 uppercase">Bloqueado</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; }
  `]
})
export class ProjectGanttComponent implements OnInit {
  @Input() projectId!: string;
  @Input() projectStartDate!: string | Date;
  @Input() projectEndDate!: string | Date;

  tasks = signal<Task[]>([]);
  isLoading = signal(true);

  timelineMonths = signal<string[]>([]);

  constructor(private tasksService: TasksService) {}

  ngOnInit() {
    this.generateTimeline();
    this.loadTasks();
  }

  generateTimeline() {
    const start = new Date(this.projectStartDate);
    const end = this.projectEndDate ? new Date(this.projectEndDate) : new Date(start.getTime() + (120 * 24 * 60 * 60 * 1000));
    
    // Calcular cuántos meses hay entre inicio y fin
    const monthDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth()) + 1;
    const numMonths = Math.max(4, Math.min(monthDiff, 24)); // Entre 4 y 24 meses para no saturar
    
    const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
    const timeline = [];
    for (let i = 0; i < numMonths; i++) {
      const d = new Date(start);
      d.setMonth(start.getMonth() + i);
      timeline.push(`${months[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`);
    }
    this.timelineMonths.set(timeline);
  }

  loadTasks() {
    this.isLoading.set(true);
    this.tasksService.findAll(this.projectId).subscribe({
      next: (data) => {
        this.tasks.set(data);
        // Si no hay fecha de fin de proyecto, ajustamos el timeline basado en la tarea más lejana
        if (!this.projectEndDate && data.length > 0) {
          const latestTaskDate = Math.max(...data.map(t => new Date(t.endDate || t.startDate || t.createdAt).getTime()));
          const fourMonthsFromStart = new Date(this.projectStartDate).getTime() + (120 * 24 * 60 * 60 * 1000);
          if (latestTaskDate > fourMonthsFromStart) {
             this.generateTimeline(); // Regenerar con el nuevo rango si es necesario
          }
        }
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'pendiente': return 'bg-slate-400';
      case 'en_progreso': return 'bg-blue-500';
      case 'completado': return 'bg-green-500';
      case 'bloqueado': return 'bg-red-400';
      default: return 'bg-slate-300';
    }
  }

  getProgress(task: Task): number {
    if (task.status === 'completado') return 100;
    if (task.status === 'en_progreso') return 50;
    if (task.status === 'bloqueado') return 20;
    return 0;
  }

  getTaskStartOffset(task: Task): number {
    const projectStart = new Date(this.projectStartDate).getTime();
    let projectEnd = this.projectEndDate ? new Date(this.projectEndDate).getTime() : projectStart + (120 * 24 * 60 * 60 * 1000);
    
    // Si hay tareas más allá del fin "estimado", ampliamos el rango visual
    if (this.tasks().length > 0) {
      const latestTaskDate = Math.max(...this.tasks().map(t => new Date(t.endDate || t.startDate || t.createdAt).getTime()));
      if (latestTaskDate > projectEnd) projectEnd = latestTaskDate + (30 * 24 * 60 * 60 * 1000); // +1 mes de margen
    }

    const taskStart = new Date(task.startDate || task.createdAt).getTime();
    const totalDuration = projectEnd - projectStart;
    const offset = taskStart - projectStart;
    
    const percentage = (offset / totalDuration) * 100;
    return Math.max(0, Math.min(percentage, 98));
  }

  getTaskWidth(task: Task): number {
    const projectStart = new Date(this.projectStartDate).getTime();
    let projectEnd = this.projectEndDate ? new Date(this.projectEndDate).getTime() : projectStart + (120 * 24 * 60 * 60 * 1000);
    
    if (this.tasks().length > 0) {
      const latestTaskDate = Math.max(...this.tasks().map(t => new Date(t.endDate || t.startDate || t.createdAt).getTime()));
      if (latestTaskDate > projectEnd) projectEnd = latestTaskDate + (30 * 24 * 60 * 60 * 1000);
    }

    const taskStart = new Date(task.startDate || task.createdAt).getTime();
    const taskEnd = task.endDate ? new Date(task.endDate).getTime() : taskStart + (7 * 24 * 60 * 60 * 1000);
    
    const totalDuration = projectEnd - projectStart;
    const taskDuration = taskEnd - taskStart;
    
    let percentage = (taskDuration / totalDuration) * 100;
    if (percentage < 2) percentage = 2; // Min width visible
    
    const offset = this.getTaskStartOffset(task);
    if (offset + percentage > 100) percentage = 100 - offset;
    
    return percentage;
  }
}
