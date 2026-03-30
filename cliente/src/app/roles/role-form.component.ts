import { Component, OnInit, signal, input, output, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormControl } from '@angular/forms';
import { RolesService, Permission, Role, CreateRoleDto } from '../core/services/roles.service';
import { SharedInputComponent } from '../shared/components/input/input';
import { SharedButtonComponent } from '../shared/components/button/button';
import { ToastService } from '../core/services/toast.service';

@Component({
  selector: 'app-role-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SharedInputComponent, SharedButtonComponent],
  template: `
    <div class="container mx-auto p-4 max-w-2xl">
      <div class="bg-white rounded-xl shadow-lg p-6">
        <h1 class="text-2xl font-bold mb-6 text-slate-800">{{ isEdit ? 'Editar Rol' : 'Nuevo Rol' }}</h1>

        <form [formGroup]="roleForm" (ngSubmit)="onSubmit()" class="space-y-6">
          <app-shared-input
            label="Nombre del Rol"
            type="text"
            placeholder="Ej: Editor, Supervisor..."
            [control]="getNameControl()"
            [error]="fieldErrors()['name']"
          />

          <div class="flex flex-col gap-1.5">
            <label class="text-sm font-semibold text-slate-700">Descripción</label>
            <textarea 
              formControlName="description"
              class="w-full px-4 py-3 rounded-xl border border-slate-200 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all text-slate-800 bg-slate-50/50 min-h-[80px]"
              placeholder="¿Qué puede hacer este rol?"
            ></textarea>
          </div>

          <div>
            <label class="block text-sm font-semibold text-slate-700 mb-4 flex items-center justify-between">
              Permisos Asociados
              <span class="text-xs font-normal text-slate-500">{{ selectedCount() }} seleccionados</span>
            </label>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto p-2 border border-slate-100 rounded-xl bg-slate-50/30">
              <div 
                *ngFor="let perm of permissions()" 
                class="flex items-center gap-3 p-3 rounded-lg border border-transparent hover:border-slate-200 hover:bg-white transition-all cursor-pointer"
                (click)="togglePermission(perm.slug)"
              >
                <input 
                  type="checkbox" 
                  [checked]="isPermissionSelected(perm.slug)"
                  class="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                >
                <div class="flex flex-col">
                  <span class="text-sm font-medium text-slate-800">{{ perm.name }}</span>
                  <span class="text-[10px] text-slate-500">{{ perm.slug }}</span>
                </div>
              </div>
            </div>
            <div *ngIf="fieldErrors()['permissionSlugs']" class="text-red-500 text-xs mt-2">
              {{ fieldErrors()['permissionSlugs'] }}
            </div>
          </div>

          <div class="flex gap-4 pt-4">
            <app-shared-button
              [label]="isLoading ? (isEdit ? 'Actualizando...' : 'Creando...') : (isEdit ? 'Actualizar' : 'Crear')"
              type="submit"
              [disabled]="roleForm.invalid || isLoading || selectedCount() === 0"
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

          <div *ngIf="error" class="text-red-500 text-sm font-semibold text-center mt-2">
            {{ error }}
          </div>
        </form>
      </div>
    </div>
  `
})
export class RoleFormComponent implements OnInit {
  roleId = input<string | null>(null);
  onSuccess = output<void>();
  onCancel = output<void>();
  
  roleForm: FormGroup;
  permissions = signal<Permission[]>([]);
  selectedPermissions = signal<string[]>([]);
  isLoading = false;
  error = '';
  isEdit = false;
  fieldErrors = signal<Record<string, string>>({});

  constructor(
    private fb: FormBuilder,
    private rolesService: RolesService,
    private toastService: ToastService
  ) {
    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      description: [''],
    });

    effect(() => {
      const id = this.roleId();
      this.resetForm();
      this.isEdit = !!id;
      if (this.isEdit) {
        this.loadRole(id!);
      }
    });
  }

  ngOnInit() {
    this.loadPermissions();
  }

  getNameControl() { return this.roleForm.get('name') as FormControl | null; }

  resetForm() {
    this.roleForm.reset();
    this.selectedPermissions.set([]);
    this.fieldErrors.set({});
    this.error = '';
  }

  loadPermissions() {
    this.rolesService.getPermissions().subscribe({
      next: (data) => this.permissions.set(data),
      error: () => this.toastService.error('Error al cargar permisos')
    });
  }

  loadRole(id: string) {
    this.isLoading = true;
    this.rolesService.findOne(id).subscribe({
      next: (role) => {
        this.roleForm.patchValue({
          name: role.name,
          description: role.description || ''
        });
        this.selectedPermissions.set(role.permissions.map(p => p.slug));
        this.isLoading = false;
      },
      error: () => {
        this.error = 'Error al cargar el rol';
        this.isLoading = false;
      }
    });
  }

  togglePermission(slug: string) {
    const current = this.selectedPermissions();
    if (current.includes(slug)) {
      this.selectedPermissions.set(current.filter(s => s !== slug));
    } else {
      this.selectedPermissions.set([...current, slug]);
    }
  }

  isPermissionSelected(slug: string): boolean {
    return this.selectedPermissions().includes(slug);
  }

  selectedCount() {
    return this.selectedPermissions().length;
  }

  onSubmit() {
    if (this.roleForm.valid && this.selectedCount() > 0) {
      this.isLoading = true;
      this.error = '';
      this.fieldErrors.set({});

      const formData = {
        ...this.roleForm.value,
        permissionSlugs: this.selectedPermissions()
      };

      if (this.isEdit) {
        this.rolesService.update(this.roleId()!, formData).subscribe({
          next: () => {
            this.isLoading = false;
            this.toastService.success('Rol actualizado correctamente');
            this.onSuccess.emit();
          },
          error: (err) => this.handleError(err)
        });
      } else {
        this.rolesService.create(formData).subscribe({
          next: () => {
            this.isLoading = false;
            this.toastService.success('Rol creado correctamente');
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
    if (errorData.message) {
      this.toastService.error(errorData.message);
      if (errorData.details && Array.isArray(errorData.details)) {
        const errors: Record<string, string> = {};
        errorData.details.forEach((detail: any) => {
          const field = detail.path?.[0] || 'campo';
          errors[field] = detail.message;
        });
        this.fieldErrors.set(errors);
      }
    }
  }

  cancel() {
    this.onCancel.emit();
  }
}
