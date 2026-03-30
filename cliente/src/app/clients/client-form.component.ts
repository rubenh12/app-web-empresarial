import { Component, OnInit, signal, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ClientsService, CreateClientDto, UpdateClientDto } from '../core/services/clients.service';
import { SharedInputComponent } from '../shared/components/input/input';
import { SharedButtonComponent } from '../shared/components/button/button';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedInputComponent, SharedButtonComponent],
  template: `
    <div class="container mx-auto p-6 max-w-2xl">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold mb-6">{{ isEdit ? 'Editar Cliente' : 'Nuevo Cliente' }}</h1>

        <form [formGroup]="clientForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <app-shared-input
            label="Nombre"
            type="text"
            placeholder="Nombre del cliente"
            [control]="getNameControl()"
            [error]="fieldErrors()['name']"
          />

          <app-shared-input
            label="Email"
            type="email"
            placeholder="correo@ejemplo.com"
            [control]="getEmailControl()"
            [error]="fieldErrors()['email']"
          />

          <app-shared-input
            label="Teléfono"
            type="text"
            placeholder="12345678"
            [maxLength]="8"
            [control]="getPhoneControl()"
            [error]="fieldErrors()['phone']"
          />

          <app-shared-input
            label="Empresa"
            type="text"
            placeholder="Nombre de la empresa"
            [control]="getCompanyControl()"
            [error]="fieldErrors()['company']"
          />

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Estado</label>
            <select 
              formControlName="status" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
            </select>
            <div *ngIf="fieldErrors()['status']" class="text-red-500 text-sm mt-1">
              {{ fieldErrors()['status'] }}
            </div>
          </div>

          <div class="flex gap-4 pt-4">
            <app-shared-button
              [label]="isLoading ? (isEdit ? 'Actualizando...' : 'Creando...') : (isEdit ? 'Actualizar' : 'Crear')"
              type="submit"
              [disabled]="clientForm.invalid || isLoading"
            />
            <app-shared-button
              label="Cancelar"
              type="button"
              (click)="cancel()"
              [disabled]="isLoading"
              variant="secondary"
            />
          </div>

          <div *ngIf="error" class="text-red-500 text-sm font-semibold text-center mt-4">
            {{ error }}
          </div>
        </form>
      </div>
    </div>
  `
})
export class ClientFormComponent implements OnInit {
  clientId = input<string | null>(null);
  onSuccess = output<void>();
  onCancel = output<void>();
  
  clientForm: FormGroup;
  isLoading = false;
  error = '';
  isEdit = false;
  fieldErrors = signal<Record<string, string>>({});

  constructor(
    private fb: FormBuilder,
    private clientsService: ClientsService,
    private toastService: ToastService
  ) {
    this.clientForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(8), Validators.pattern('^[0-9]*$')]],
      company: [''],
      status: ['activo']
    });

    effect(() => {
      const id = this.clientId();
      
      this.clientForm.reset({ status: 'activo' });
      this.fieldErrors.set({});
      this.error = '';
      
      this.isEdit = !!id;
      
      if (this.isEdit) {
        this.loadClient(id!);
      }
    });
  }

  ngOnInit() {}

  getNameControl() { return this.clientForm.get('name') as FormControl | null; }
  getEmailControl() { return this.clientForm.get('email') as FormControl | null; }
  getPhoneControl() { return this.clientForm.get('phone') as FormControl | null; }
  getCompanyControl() { return this.clientForm.get('company') as FormControl | null; }
  getStatusControl() { return this.clientForm.get('status') as FormControl | null; }

  loadClient(id: string) {
    this.isLoading = true;
    this.clientsService.findOne(id).subscribe({
      next: (client) => {
        this.clientForm.patchValue({
          name: client.name,
          email: client.email,
          phone: client.phone || '',
          company: client.company || '',
          status: client.status || 'activo'
        });
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Error al cargar el cliente';
        this.isLoading = false;
        this.toastService.error('Error al cargar el cliente');
      }
    });
  }

  onSubmit() {
    if (this.clientForm.valid) {
      this.isLoading = true;
      this.error = '';
      this.fieldErrors.set({});

      const formData = this.clientForm.value;

      if (this.isEdit) {
        const id = this.clientId()!;
        const updateDto: UpdateClientDto = { ...formData };

        this.clientsService.update(id, updateDto).subscribe({
          next: () => {
             this.isLoading = false;
             this.toastService.success('Cliente actualizado correctamente');
             this.onSuccess.emit();
          },
          error: (err) => this.handleError(err)
        });
      } else {
        const createDto: CreateClientDto = { ...formData };
        this.clientsService.create(createDto).subscribe({
          next: () => {
            this.isLoading = false;
            this.toastService.success('Cliente creado correctamente');
            this.onSuccess.emit();
          },
          error: (err) => this.handleError(err)
        });
      }
    }
  }

  private handleError(err: any) {
    this.isLoading = false;
    const errorData = err.error || {};
    const status = err.status;
    
    if (status === 409 && errorData.message) {
      const message = errorData.message;
      const fieldName = message.toLowerCase().includes('email') ? 'email' : 'campo';
      
      const fieldErrors: Record<string, string> = {};
      fieldErrors[fieldName] = message;
      this.fieldErrors.set(fieldErrors);
      this.toastService.error(message);
    } else if (errorData.message) {
       this.toastService.error(errorData.message);
       if(errorData.details && Array.isArray(errorData.details)){
         const errors: Record<string, string> = {};
         errorData.details.forEach((detail: any) => {
           const field = detail.path?.[0] || 'campo';
           const message = detail.message || 'Valor inválido';
           errors[field] = message;
         });
         this.fieldErrors.set(errors);
       }
    } else {
      this.toastService.error('Error al procesar la solicitud');
      this.error = 'Error al procesar la solicitud';
    }
  }

  cancel() {
    this.onCancel.emit();
  }
}
