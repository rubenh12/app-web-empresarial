import { Component, OnInit, signal, ViewChild, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TasksService, Task } from '../core/services/tasks.service';
import { ProjectsService, Project } from '../core/services/projects.service';
import { AuthService } from '../core/services/auth.service';
import { ToastService } from '../core/services/toast.service';
import { SharedButtonComponent } from '../shared/components/button/button';
import { ModalComponent } from '../shared/components/modal/modal.component';
import { TaskFormComponent } from './task-form.component.js';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-tasks',
  standalone: true,
  imports: [CommonModule, SharedButtonComponent, ModalComponent, TaskFormComponent, FormsModule],
  template: `
    <div class="container mx-auto p-6">
      <div *ngIf="showHeader" class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 class="text-3xl font-bold text-slate-800">Tareas</h1>
          <p class="text-slate-500 text-sm mt-1">Gestión y seguimiento de actividades</p>
        </div>
        
        <div class="flex items-center gap-4 w-full md:w-auto">
          <div *ngIf="!projectId" class="flex flex-col min-w-[200px]">
            <select 
              [ngModel]="currentProjectId()"
              (ngModelChange)="onProjectChange($event)" 
              class="px-4 py-2 rounded-xl border border-slate-200 bg-white outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option [value]="null">Selecciona un proyecto...</option>
              <option *ngFor="let p of allProjects()" [value]="p.id">{{ p.name }}</option>
            </select>
          </div>
          
          <app-shared-button 
            *ngIf="canCreateTasks && (projectId || currentProjectId())"
            label="Nueva Tarea" 
            (click)="openCreateModal()"
            type="button"
            variant="secondary"
          />
        </div>
      </div>

      <div *ngIf="isLoading()" class="p-12 text-center">
        <div class="text-slate-400">Cargando tablero de tareas...</div>
      </div>

      <div *ngIf="!isLoading() && tasks().length === 0" class="p-12 text-center text-slate-400 border-2 border-dashed border-slate-200 rounded-3xl">
        <p class="text-lg font-medium">No hay tareas para mostrar</p>
        <p class="text-sm">Selecciona un proyecto o crea una nueva tarea para comenzar.</p>
      </div>

      <div *ngIf="!isLoading() && tasks().length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div *ngFor="let status of statusList" class="flex flex-col gap-4">
          <div class="flex items-center justify-between px-2 mb-2">
            <h3 class="font-bold text-slate-600 uppercase text-xs tracking-widest">{{ getStatusLabel(status) }}</h3>
            <span class="bg-slate-200 text-slate-600 text-[10px] px-2 py-0.5 rounded-full font-bold">
              {{ getTasksByStatus(status).length }}
            </span>
          </div>

          <div class="space-y-4">
            <div *ngFor="let t of getTasksByStatus(status)" class="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-default group">
              <div class="flex justify-between items-start mb-3">
                <span 
                  class="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase transition-colors"
                  [ngClass]="getPriorityClasses(t.priority)"
                >
                  {{ t.priority }}
                </span>
                <div class="flex gap-2">
                  <button (click)="openEditModal(t.id)" class="text-slate-400 hover:text-blue-600">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                  </button>
                  <button (click)="deleteTask(t.id)" class="text-slate-400 hover:text-red-500">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                  </button>
                </div>
              </div>
              
              <h4 class="font-bold text-slate-800 text-sm mb-1 leading-snug">{{ t.title }}</h4>
              <p class="text-xs text-slate-400 line-clamp-2 mb-4">{{ t.description || 'Sin descripción' }}</p>
              
              <div class="flex items-center justify-between pt-4 border-t border-slate-50">
                <div class="flex items-center gap-2">
                  <div class="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-[10px] font-bold text-blue-600">
                    {{ t.assignedTo?.name?.charAt(0) }}
                  </div>
                  <span class="text-[11px] font-medium text-slate-500">{{ t.assignedTo?.name }}</span>
                </div>
                <span *ngIf="!projectId" class="text-[10px] font-bold text-slate-300 uppercase tracking-tighter truncate max-w-[80px]">{{ t.project?.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <app-modal #deleteModal>
        <div class="text-center p-4">
          <p class="mb-6 font-medium text-slate-600">¿Estás seguro de que deseas eliminar esta tarea?</p>
          <div class="flex justify-center gap-4">
            <app-shared-button label="Cancelar" type="button" (click)="closeDeleteModal()" />
            <app-shared-button label="Eliminar" type="button" (click)="confirmDelete()" variant="danger" />
          </div>
        </div>
      </app-modal>

      <app-modal #modal>
        <app-task-form 
          *ngIf="modal.isOpen()"
          [taskId]="editingTaskId()"
          [projectId]="projectId || currentProjectId()"
          (onSuccess)="onFormSuccess()"
          (onCancel)="closeModal()"
        ></app-task-form>
      </app-modal>
    </div>
  `
})
export class TasksComponent implements OnInit {
  @Input() projectId: string | null = null;
  @Input() showHeader = true;

  tasks = signal<Task[]>([]);
  allProjects = signal<Project[]>([]);
  currentProjectId = signal<string | null>(null);
  isLoading = signal(false);
  editingTaskId = signal<string | null>(null);
  taskToDelete = signal<string | null>(null);

  statusList = ['pendiente', 'en_progreso', 'completado', 'bloqueado'];

  @ViewChild('modal') modal!: ModalComponent;
  @ViewChild('deleteModal') deleteModal!: ModalComponent;

  constructor(
    private tasksService: TasksService,
    private projectsService: ProjectsService,
    private authService: AuthService,
    private toastService: ToastService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() { 
    this.route.queryParams.subscribe(params => {
      const pid = params['projectId'] || this.projectId;
      if (pid) {
        this.currentProjectId.set(pid);
        this.loadTasks();
      }
    });

    this.loadProjects();
  }

  get canCreateTasks() { return this.authService.hasPermission('CREAR_TAREAS'); }
  get canUpdateTasks() { return this.authService.hasPermission('ACTUALIZAR_TAREAS'); }
  get canDeleteTasks() { return this.authService.hasPermission('ELIMINAR_TAREAS'); }

  loadProjects() {
    this.projectsService.findAll().subscribe(data => this.allProjects.set(data));
  }

  loadTasks() {
    const pid = this.projectId || this.currentProjectId();
    if (!pid) {
      this.tasks.set([]);
      this.isLoading.set(false);
      return;
    }

    this.isLoading.set(true);
    this.tasksService.findAll(pid).subscribe({
      next: (data) => {
        this.tasks.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  onProjectChange(id: string | null) {
    this.currentProjectId.set(id);
    this.loadTasks();
  }

  getTasksByStatus(status: string): Task[] {
    return this.tasks().filter(t => t.status === status);
  }

  openCreateModal() {
    this.editingTaskId.set(null);
    this.modal.open({ title: 'Nueva Tarea', size: 'lg' });
  }

  openEditModal(id: string) {
    this.editingTaskId.set(id);
    this.modal.open({ title: 'Editar Tarea', size: 'lg' });
  }

  closeModal() { this.modal.close(); }

  onFormSuccess() {
    this.closeModal();
    this.loadTasks();
  }

  deleteTask(id: string) {
    this.taskToDelete.set(id);
    this.deleteModal.open({ title: 'Confirmar Eliminación', size: 'sm' });
  }

  closeDeleteModal() {
    this.deleteModal.close();
    this.taskToDelete.set(null);
  }

  confirmDelete() {
    const id = this.taskToDelete();
    if (id) {
      this.tasksService.remove(id).subscribe({
        next: () => {
          this.toastService.success('Tarea eliminada');
          this.closeDeleteModal();
          this.loadTasks();
        },
        error: () => this.toastService.error('Error al eliminar')
      });
    }
  }

  getPriorityClasses(priority: string): string {
    const map: any = {
      'alta': 'bg-red-100 text-red-700',
      'media': 'bg-orange-100 text-orange-700',
      'baja': 'bg-blue-100 text-blue-700'
    };
    return map[priority] || 'bg-gray-100';
  }

  getStatusLabel(status: string): string {
    const map: any = {
      'pendiente': 'Pendiente',
      'en_progreso': 'En Proceso',
      'completado': 'Completada',
      'bloqueado': 'Bloqueada'
    };
    return map[status] || status;
  }

  getStatusClasses(status: string): string {
    const map: any = {
      'pendiente': 'bg-slate-100 text-slate-500',
      'en_progreso': 'bg-blue-100 text-blue-600',
      'completada': 'bg-green-100 text-green-600',
      'bloqueado': 'bg-red-100 text-red-500'
    };
    return map[status] || 'bg-gray-100';
  }
}
