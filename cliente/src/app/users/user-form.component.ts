import { Component, OnInit, signal, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UsersService, User, CreateUserDto, UpdateUserDto } from '../core/services/users.service';
import { SharedInputComponent } from '../shared/components/input/input';
import { SharedButtonComponent } from '../shared/components/button/button';
import { ToastService } from '../core/services/toast.service';

interface Role {
  id: string;
  name: string;
  description?: string;
}

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedInputComponent, SharedButtonComponent],
  template: `
    <div class="container mx-auto p-6 max-w-2xl">
      <div class="bg-white rounded-lg shadow-lg p-8">
        <h1 class="text-3xl font-bold mb-6">{{ isEdit ? 'Editar Usuario' : 'Nuevo Usuario' }}</h1>

        <form [formGroup]="userForm" (ngSubmit)="onSubmit()" class="space-y-4">
          <app-shared-input
            label="Nombre"
            type="text"
            placeholder="Nombre completo"
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
            *ngIf="!isEdit"
            label="Contraseña"
            type="password"
            placeholder="Mínimo 6 caracteres"
            [control]="getPasswordControl()"
            [error]="fieldErrors()['password']"
          />

          <app-shared-input
            *ngIf="isEdit"
            label="Nueva Contraseña (opcional)"
            type="password"
            placeholder="Dejar en blanco para no cambiar"
            [control]="getPasswordControl()"
            [error]="fieldErrors()['password']"
          />

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">Rol</label>
            <select 
              formControlName="roleId" 
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Seleccionar rol</option>
              <option *ngFor="let role of roles()" [value]="role.id">
                {{ role.name }} - {{ role.description }}
              </option>
            </select>
            <div *ngIf="getRoleControl()?.invalid && getRoleControl()?.touched" class="text-red-500 text-sm mt-1">
              El rol es requerido
            </div>
            <div *ngIf="fieldErrors()['roleId']" class="text-red-500 text-sm mt-1">
              {{ fieldErrors()['roleId'] }}
            </div>
          </div>

          <div class="flex gap-4 pt-4">
            <app-shared-button
              [label]="isLoading ? (isEdit ? 'Actualizando...' : 'Creando...') : (isEdit ? 'Actualizar' : 'Crear')"
              type="submit"
              [disabled]="userForm.invalid || isLoading"
            />
            <app-shared-button
              label="Cancelar"
              type="button"
              (click)="cancel()"
              [disabled]="isLoading"
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
export class UserFormComponent implements OnInit {
  userId = input<string | null>(null);
  onSuccess = output<void>();
  onCancel = output<void>();
  
  userForm: FormGroup;
  roles = signal<Role[]>([]);
  isLoading = false;
  error = '';
  isEdit = false;
  fieldErrors = signal<Record<string, string>>({});

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private router: Router,
    private toastService: ToastService
  ) {
    this.userForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.minLength(6)]],
      roleId: ['', Validators.required]
    });

    effect(() => {
      const userId = this.userId();
      
      this.userForm.reset();
      this.fieldErrors.set({});
      this.error = '';
      
      this.isEdit = !!userId;
      
      if (this.isEdit) {
        this.userForm.get('password')?.removeValidators(Validators.required);
        this.userForm.get('password')?.updateValueAndValidity();
        this.loadUser(userId!);
      } else {
        this.userForm.get('password')?.addValidators([Validators.required, Validators.minLength(6)]);
        this.userForm.get('password')?.updateValueAndValidity();
      }
    });
  }

  ngOnInit() {
    this.loadRoles();
  }

  getNameControl() {
    return this.userForm.get('name') as FormControl | null;
  }

  getEmailControl() {
    return this.userForm.get('email') as FormControl | null;
  }

  getPasswordControl() {
    return this.userForm.get('password') as FormControl | null;
  }

  getRoleControl() {
    return this.userForm.get('roleId') as FormControl | null;
  }

  loadRoles() {
    this.usersService.getRoles().subscribe({
      next: (roles) => {
        this.roles.set(roles);
      },
      error: () => {
        // Fallback en caso de error
        this.roles.set([
          { id: '1', name: 'ADMIN', description: 'Administrador con acceso total' },
          { id: '2', name: 'USUARIO', description: 'Usuario con acceso básico' }
        ]);
      }
    });
  }

  loadUser(id: string) {
    this.isLoading = true;
    this.usersService.findOne(id).subscribe({
      next: (user) => {
        this.userForm.patchValue({
          name: user.name,
          email: user.email,
          roleId: user.role.id
        });
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Error al cargar el usuario';
        this.isLoading = false;
      }
    });
  }

  onSubmit() {
    if (this.userForm.valid) {
      this.isLoading = true;
      this.error = '';
      this.fieldErrors.set({});

      const formData = this.userForm.value;

      if (this.isEdit) {
        const userId = this.userId()!;
        const updateDto: UpdateUserDto = {
          name: formData.name,
          email: formData.email,
          roleId: formData.roleId
        };

        if (formData.password) {
          updateDto.password = formData.password;
        }

        this.usersService.update(userId, updateDto).subscribe({
          next: () => {
            this.isLoading = false;
            this.toastService.success('Usuario actualizado correctamente');
            this.onSuccess.emit();
          },
          error: (err) => {
            this.handleError(err);
          }
        });
      } else {
        const createDto: CreateUserDto = {
          name: formData.name,
          email: formData.email,
          password: formData.password,
          roleId: formData.roleId
        };

        this.usersService.create(createDto).subscribe({
          next: () => {
            this.isLoading = false;
            this.toastService.success('Usuario creado correctamente');
            this.onSuccess.emit();
          },
          error: (err) => {
            this.handleError(err);
          }
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
      
      if (errorData.details && Array.isArray(errorData.details)) {
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
