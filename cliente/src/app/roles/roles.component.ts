import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RolesService, Role } from '../core/services/roles.service';
import { AuthService } from '../core/services/auth.service';
import { ToastService } from '../core/services/toast.service';
import { SharedButtonComponent } from '../shared/components/button/button';
import { ModalComponent } from '../shared/components/modal/modal.component';
import { RoleFormComponent } from './role-form.component';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, SharedButtonComponent, ModalComponent, RoleFormComponent],
  template: `
    <div class="container mx-auto p-6 animate-fade-in">
      <div class="flex justify-between items-center mb-8">
        <div>
          <h1 class="text-3xl font-extrabold text-slate-800">Roles y Permisos</h1>
          <p class="text-slate-500 mt-1">Gestiona los niveles de acceso y permisos de los usuarios.</p>
        </div>
        <app-shared-button 
          *ngIf="canManageRoles"
          label="Nuevo Rol" 
          (click)="openCreateModal()"
          type="button"
          variant="secondary"
          class="shadow-lg shadow-blue-100"
        />
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div *ngIf="isLoading()" class="col-span-full py-20 flex flex-col items-center justify-center bg-white rounded-3xl border border-slate-100">
           <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mb-4"></div>
           <p class="text-slate-500 font-medium">Cargando roles del sistema...</p>
        </div>

        <div *ngIf="!isLoading() && roles().length === 0" class="col-span-full py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
          <div class="text-slate-300 mb-4">
            <svg class="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-3.04l.53-.53m10.911-8.11l.458-.458m-3.418-4.417A14.992 14.992 0 0112 15c-1.222 0-2.391-.147-3.504-.422m3.014-4.288l.458-.458m-3.418-4.417A14.992 14.992 0 0112 15c-1.222 0-2.391-.147-3.504-.422"></path>
            </svg>
          </div>
          <p class="text-slate-500">No se encontraron roles personalizados.</p>
        </div>

        <div 
          *ngFor="let role of roles()" 
          class="bg-white rounded-3xl border border-slate-100 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all p-6 relative group"
        >
          <div class="flex justify-between items-start mb-4">
             <div class="p-3 rounded-2xl bg-slate-50 text-slate-700">
                <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
                </svg>
             </div>
             <div class="flex gap-1 transition-opacity">
                <button 
                   *ngIf="canManageRoles && role.name !== 'ADMIN'"
                   (click)="openEditModal(role.id)"
                   class="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
                  </svg>
                </button>
                <button 
                   *ngIf="canManageRoles && role.name !== 'ADMIN'"
                   (click)="deleteRole(role.id)"
                   class="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                >
                  <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                  </svg>
                </button>
             </div>
          </div>

          <h3 class="text-xl font-bold text-slate-800 mb-2">{{ role.name }}</h3>
          <p class="text-slate-500 text-sm mb-6 line-clamp-2 min-h-[40px]">{{ role.description || 'Sin descripción' }}</p>

          <div class="pt-4 border-t border-slate-50 flex items-center justify-between">
            <span class="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full">
              {{ role.permissions.length }} Permisos
            </span>
            <span class="text-[10px] text-slate-400">ID: {{ role.id }}</span>
          </div>
        </div>
      </div>

      <app-modal #deleteModal>
        <div class="text-center p-2">
          <h2 class="text-xl font-bold text-slate-800 mb-2">¿Eliminar Rol?</h2>
          <p class="text-slate-500 mb-6 font-medium">Esta acción no se puede deshacer y puede afectar a los usuarios asignados.</p>
          <div class="flex justify-center gap-3">
            <app-shared-button label="Cancelar" variant="secondary" (click)="closeDeleteModal()" />
            <app-shared-button label="Eliminar" variant="danger" (click)="confirmDelete()" />
          </div>
        </div>
      </app-modal>

      <app-modal #modal>
        <app-role-form 
          *ngIf="modal.isOpen()"
          [roleId]="editingRoleId()"
          (onSuccess)="onFormSuccess()"
          (onCancel)="closeModal()"
        ></app-role-form>
      </app-modal>
    </div>
  `
})
export class RolesComponent implements OnInit {
  roles = signal<Role[]>([]);
  isLoading = signal(true);
  editingRoleId = signal<string | null>(null);
  roleToDelete = signal<string | null>(null);

  @ViewChild('modal') modal!: ModalComponent;
  @ViewChild('deleteModal') deleteModal!: ModalComponent;

  constructor(
    private rolesService: RolesService,
    private authService: AuthService,
    private toastService: ToastService
  ) { }

  ngOnInit() {
    this.loadRoles();
  }

  get canManageRoles() { 
    return this.authService.hasPermission('crear:usuarios') || 
           this.authService.hasPermission('actualizar:usuarios') ||
           this.authService.hasPermission('eliminar:usuarios');
  }

  loadRoles() {
    this.isLoading.set(true);
    this.rolesService.findAll().subscribe({
      next: (data) => {
        this.roles.set(data);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }

  openCreateModal() {
    this.editingRoleId.set(null);
    this.modal.open({ title: 'Gestión de Roles', size: 'md' });
  }

  openEditModal(id: string) {
    this.editingRoleId.set(id);
    this.modal.open({ title: 'Editar Rol', size: 'md' });
  }

  closeModal() {
    this.modal.close();
  }

  onFormSuccess() {
    this.closeModal();
    this.loadRoles();
  }

  deleteRole(id: string) {
    this.roleToDelete.set(id);
    this.deleteModal.open({ title: 'Confirmar Eliminación', size: 'sm' });
  }

  closeDeleteModal() {
    this.deleteModal.close();
    this.roleToDelete.set(null);
  }

  confirmDelete() {
    const id = this.roleToDelete();
    if (id) {
      this.rolesService.remove(id).subscribe({
        next: () => {
          this.toastService.success('Rol eliminado correctamente');
          this.closeDeleteModal();
          this.loadRoles();
        },
        error: (err) => {
          this.toastService.error(err.error?.message || 'Error al eliminar el rol');
          this.closeDeleteModal();
        }
      });
    }
  }
}
