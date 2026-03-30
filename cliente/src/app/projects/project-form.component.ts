import { Component, OnInit, signal, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ProjectsService, CreateProjectDto, UpdateProjectDto } from '../core/services/projects.service';
import { ClientsService, Client } from '../core/services/clients.service';
import { SharedInputComponent } from '../shared/components/input/input';
import { SharedButtonComponent } from '../shared/components/button/button';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedInputComponent, SharedButtonComponent],
  template: `
    <div class="container mx-auto p-6 max-w-2xl">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold mb-6 text-slate-800">{{ isEdit ? 'Editar Proyecto' : 'Nuevo Proyecto' }}</h1>

        <form [formGroup]="projectForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <app-shared-input
            label="Nombre del Proyecto"
            type="text"
            placeholder="Ej: Rediseño Web"
            [control]="getNameControl()"
            [error]="fieldErrors()['name']"
          />

          <div>
            <label class="block text-[13px] font-semibold text-slate-500 ml-1 mb-1.5 uppercase tracking-wider">Cliente</label>
            <select 
              formControlName="clientId" 
              class="w-full px-5 h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/5 placeholder:text-slate-300 appearance-none"
            >
              <option value="" disabled>Seleccione un cliente</option>
              <option *ngFor="let client of clients()" [value]="client.id">{{ client.name }}</option>
            </select>
            <div *ngIf="fieldErrors()['clientId']" class="text-red-500 text-[11px] ml-1 mt-1">
              {{ fieldErrors()['clientId'] }}
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <app-shared-input
              label="Fecha de Inicio"
              type="date"
              [control]="getStartDateControl()"
              [error]="fieldErrors()['startDate']"
            />
            <app-shared-input
              label="Fecha de Fin"
              type="date"
              [control]="getEndDateControl()"
              [error]="fieldErrors()['endDate']"
            />
          </div>

          <div>
            <label class="block text-[13px] font-semibold text-slate-500 ml-1 mb-1.5 uppercase tracking-wider">Descripción</label>
            <textarea 
              formControlName="description" 
              class="w-full px-5 py-4 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/5 placeholder:text-slate-300 min-h-[120px]"
              placeholder="Detalles del proyecto..."
            ></textarea>
          </div>

          <div>
            <label class="block text-[13px] font-semibold text-slate-500 ml-1 mb-1.5 uppercase tracking-wider">Estado</label>
            <select 
              formControlName="status" 
              class="w-full px-5 h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none transition-all duration-300 focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/5 placeholder:text-slate-300 appearance-none"
            >
              <option value="pendiente">Pendiente</option>
              <option value="en_progreso">En Progreso</option>
              <option value="completado">Completado</option>
              <option value="cancelado">Cancelado</option>
            </select>
          </div>

          <div class="flex gap-4 pt-4">
            <app-shared-button
              [label]="isLoading ? 'Guardando...' : (isEdit ? 'Actualizar Proyecto' : 'Crear Proyecto')"
              type="submit"
              [disabled]="projectForm.invalid || isLoading"
              variant="primary"
              class="flex-1"
            />
            <app-shared-button
              label="Cancelar"
              type="button"
              (click)="cancel()"
              [disabled]="isLoading"
              variant="secondary"
            />
          </div>
        </form>
      </div>
    </div>
  `
})
export class ProjectFormComponent implements OnInit {
  projectId = input<string | null>(null);
  onSuccess = output<void>();
  onCancel = output<void>();
  
  projectForm: FormGroup;
  isLoading = false;
  error = '';
  isEdit = false;
  clients = signal<Client[]>([]);
  fieldErrors = signal<Record<string, string>>({});

  constructor(
    private fb: FormBuilder,
    private projectsService: ProjectsService,
    private clientsService: ClientsService,
    private toastService: ToastService
  ) {
    this.projectForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      startDate: ['', [Validators.required]],
      endDate: [''],
      status: ['pendiente'],
      clientId: ['', [Validators.required]]
    });

    effect(() => {
      const id = this.projectId();
      this.projectForm.reset({ status: 'pendiente', clientId: '' });
      this.fieldErrors.set({});
      this.error = '';
      this.isEdit = !!id;
      
      if (this.isEdit) {
        this.loadProject(id!);
      }
    });
  }

  ngOnInit() {
    this.loadClients();
  }

  loadClients() {
    this.clientsService.findAll().subscribe({
      next: (data) => this.clients.set(data),
      error: () => this.toastService.error('Error al cargar clientes')
    });
  }

  getNameControl() { return this.projectForm.get('name') as FormControl; }
  getStartDateControl() { return this.projectForm.get('startDate') as FormControl; }
  getEndDateControl() { return this.projectForm.get('endDate') as FormControl; }

  loadProject(id: string) {
    this.isLoading = true;
    this.projectsService.findOne(id).subscribe({
      next: (p) => {
        this.projectForm.patchValue({
          name: p.name,
          description: p.description,
          startDate: p.startDate.split('T')[0],
          endDate: p.endDate ? p.endDate.split('T')[0] : '',
          status: p.status,
          clientId: p.clientId
        });
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Error al cargar el proyecto';
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
    if (this.projectForm.valid) {
      this.isLoading = true;
      this.error = '';
      this.fieldErrors.set({});

      const formData = this.projectForm.value;

      if (this.isEdit) {
        this.projectsService.update(this.projectId()!, formData).subscribe({
          next: () => {
             this.isLoading = false;
             this.toastService.success('Proyecto actualizado');
             this.onSuccess.emit();
          },
          error: (err) => this.handleError(err)
        });
      } else {
        this.projectsService.create(formData).subscribe({
          next: () => {
            this.isLoading = false;
            this.toastService.success('Proyecto creado');
            this.onSuccess.emit();
          },
          error: (err) => this.handleError(err)
        });
      }
    }
  }

  private handleError(err: any) {
    this.isLoading = false;
    const errorResponse = err.error;
    this.error = errorResponse?.message || 'Error al procesar la solicitud';
    
    if (errorResponse?.details && Array.isArray(errorResponse.details)) {
      const errorsMap: Record<string, string> = {};
      errorResponse.details.forEach((issue: any) => {
        const field = issue.path?.[0];
        if (field) {
          errorsMap[field] = issue.message;
        }
      });
      this.fieldErrors.set(errorsMap);
    } else {
      this.toastService.error(this.error);
    }
  }

  cancel() { this.onCancel.emit(); }
}
