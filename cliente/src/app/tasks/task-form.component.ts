import { Component, OnInit, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { TasksService, CreateTaskDto, UpdateTaskDto } from '../core/services/tasks.service';
import { ProjectsService, Project } from '../core/services/projects.service';
import { UsersService, User } from '../core/services/users.service';
import { ToastService } from '../core/services/toast.service';
import { SharedInputComponent } from '../shared/components/input/input';
import { SharedButtonComponent } from '../shared/components/button/button';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedInputComponent, SharedButtonComponent],
  template: `
    <div class="bg-white rounded-xl shadow-sm p-6 overflow-hidden">
      <div class="max-w-xl mx-auto">
        <h2 class="text-2xl font-bold mb-6 text-slate-800">{{ isEdit ? 'Editar Tarea' : 'Nueva Tarea' }}</h2>
        
        <form [formGroup]="taskForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <app-shared-input label="Título" placeholder="Hacer reporte..." [control]="getControl('title')" [error]="fieldErrors()['title']"></app-shared-input>
          
          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-slate-700">Descripción (Opcional)</label>
            <textarea 
              formControlName="description"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-slate-800 bg-slate-50/50 min-h-[100px]"
              placeholder="Detalles de la tarea..."
            ></textarea>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div *ngIf="!projectId" class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-slate-700">Proyecto</label>
              <select formControlName="projectId" class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-blue-500">
                <option value="">Seleccionar...</option>
                <option *ngFor="let p of projects" [value]="p.id">{{ p.name }}</option>
              </select>
              <span *ngIf="fieldErrors()['projectId']" class="text-red-500 text-xs mt-1">{{ fieldErrors()['projectId'] }}</span>
            </div>
            <!-- Si projectId existe, Responsable ocupa todo el ancho o se queda a la derecha. 
                 Para un diseño más fluido, si projectId no existe mostramos ambos, 
                 si existe, podemos hacer que Responsable sea col-span-2 -->
            <div class="flex flex-col gap-1.5" [ngClass]="{'col-span-2': projectId}">
              <label class="text-sm font-semibold text-slate-700">Responsable</label>
              <select formControlName="userId" class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-blue-500">
                <option value="">Seleccionar...</option>
                <option *ngFor="let u of users" [value]="u.id">{{ u.name }}</option>
              </select>
              <span *ngIf="fieldErrors()['userId']" class="text-red-500 text-xs mt-1">{{ fieldErrors()['userId'] }}</span>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-slate-700">Prioridad</label>
              <select formControlName="priority" class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-blue-500">
                <option value="baja">Baja</option>
                <option value="media">Media</option>
                <option value="alta">Alta</option>
              </select>
            </div>

            <div class="flex flex-col gap-1.5">
              <label class="text-sm font-semibold text-slate-700">Estado</label>
              <select formControlName="status" class="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 outline-none focus:border-blue-500">
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En Progreso</option>
                <option value="completado">Completada</option>
                <option value="bloqueado">Bloqueada</option>
              </select>
            </div>
          </div>

          <div class="flex gap-4 pt-6">
            <app-shared-button
              [label]="isLoading ? 'Guardando...' : (isEdit ? 'Actualizar' : 'Crear')"
              type="submit"
              [disabled]="taskForm.invalid || isLoading"
              variant="primary"
              class="flex-1"
            />
            <app-shared-button label="Cancelar" type="button" (click)="cancel()" [disabled]="isLoading" variant="secondary" />
          </div>
        </form>
      </div>
    </div>
  `
})
export class TaskFormComponent implements OnInit {
  @Input() taskId: string | null = null;
  @Input() projectId: string | null = null;
  @Output() onSuccess = new EventEmitter<void>();
  @Output() onCancel = new EventEmitter<void>();

  taskForm: FormGroup;
  isLoading = false;
  projects: Project[] = [];
  users: User[] = [];
  fieldErrors = signal<Record<string, string>>({});

  constructor(
    private fb: FormBuilder,
    private tasksService: TasksService,
    private projectsService: ProjectsService,
    private usersService: UsersService,
    private toastService: ToastService
  ) {
    this.taskForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      priority: ['media', Validators.required],
      status: ['pendiente', Validators.required],
      projectId: ['', Validators.required],
      userId: ['', Validators.required]
    });
  }

  ngOnInit() {
    this.loadData();
    if (this.taskId) {
      this.loadTask();
    } else if (this.projectId) {
      this.taskForm.patchValue({ projectId: this.projectId });
    }
  }

  get isEdit() { return !!this.taskId; }

  getControl(name: string): FormControl {
    return this.taskForm.get(name) as FormControl;
  }

  loadData() {
    this.projectsService.findAll().subscribe(data => this.projects = data);
    this.usersService.findAll().subscribe(data => this.users = data);
  }

  loadTask() {
    this.isLoading = true;
    this.tasksService.findOne(this.taskId!).subscribe({
      next: (task) => {
        this.taskForm.patchValue(task);
        this.isLoading = false;
      },
      error: () => this.isLoading = false
    });
  }

  onSubmit() {
    if (this.taskForm.invalid) return;
    this.isLoading = true;
    this.fieldErrors.set({});

    const request = this.isEdit
      ? this.tasksService.update(this.taskId!, this.taskForm.value)
      : this.tasksService.create(this.taskForm.value);

    request.subscribe({
      next: () => {
        this.toastService.success(this.isEdit ? 'Tarea actualizada' : 'Tarea creada');
        this.onSuccess.emit();
      },
      error: (err) => this.handleError(err)
    });
  }

  private handleError(err: any) {
    this.isLoading = false;
    const errorResponse = err.error;
    if (errorResponse?.details && Array.isArray(errorResponse.details)) {
      const errorsMap: Record<string, string> = {};
      errorResponse.details.forEach((issue: any) => {
        const field = issue.path?.[0];
        if (field) errorsMap[field] = issue.message;
      });
      this.fieldErrors.set(errorsMap);
    } else {
      this.toastService.error(errorResponse?.message || 'Error al procesar');
    }
  }

  cancel() { this.onCancel.emit(); }
}
