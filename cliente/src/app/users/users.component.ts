import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService, User } from '../core/services/users.service';
import { AuthService } from '../core/services/auth.service';
import { ToastService } from '../core/services/toast.service';
import { Router } from '@angular/router';
import { SharedButtonComponent } from '../shared/components/button/button';
import { ModalComponent } from '../shared/components/modal/modal.component';
import { UserFormComponent } from './user-form.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, SharedButtonComponent, ModalComponent, UserFormComponent],
  template: `
    <div class="container mx-auto p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Usuarios</h1>
        <app-shared-button 
          *ngIf="canCreateUsers"
          label="Nuevo Usuario" 
          (click)="openCreateModal()"
          type="button"
          variant="secondary"
        />
      </div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <div *ngIf="isLoading()" class="p-6 text-center">
          <div class="text-gray-500">Cargando usuarios...</div>
        </div>
        
        <div *ngIf="!isLoading() && users().length === 0" class="p-6 text-center">
          <div class="text-gray-500">No hay usuarios registrados</div>
        </div>

        <table *ngIf="!isLoading() && users().length > 0" class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rol</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha de Creación</th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr *ngFor="let user of users()" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">{{ user.name }}</div>
                <div class="text-sm text-gray-500">{{ user.email }}</div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {{ user.role.name }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(user.createdAt) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button 
                  *ngIf="canUpdateUsers"
                  (click)="openEditModal(user.id)"
                  class="text-indigo-600 hover:text-indigo-900 mr-3"
                >
                  Editar
                </button>
                <button 
                  *ngIf="canDeleteUsers"
                  (click)="deleteUser(user.id)"
                  class="text-red-600 hover:text-red-900"
                >
                  Eliminar
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal para confirmar eliminación -->
      <app-modal #deleteModal>
        <div class="text-center">
          <p class="mb-6">¿Estás seguro de que deseas eliminar este usuario?</p>
          <div class="flex justify-center gap-4">
            <app-shared-button
              label="Cancelar"
              type="button"
              (click)="closeDeleteModal()"
            />
            <app-shared-button
              label="Eliminar"
              type="button"
              (click)="confirmDelete()"
              variant="danger"
            />
          </div>
        </div>
      </app-modal>

      <!-- Modal para crear/editar usuarios -->
      <app-modal #modal>
        <app-user-form 
          [userId]="editingUserId()"
          (onSuccess)="onFormSuccess()"
          (onCancel)="closeModal()"
        ></app-user-form>
      </app-modal>
    </div>
  `
})
export class UsersComponent implements OnInit {
  users = signal<User[]>([]);
  isLoading = signal(true);
  editingUserId = signal<string | null>(null);
  userToDelete = signal<string | null>(null);

  @ViewChild('modal') modal!: ModalComponent;
  @ViewChild('deleteModal') deleteModal!: ModalComponent;

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadUsers();
  }

  get canCreateUsers() {
    return this.authService.hasPermission('crear:usuarios');
  }

  get canUpdateUsers() {
    return this.authService.hasPermission('actualizar:usuarios');
  }

  get canDeleteUsers() {
    return this.authService.hasPermission('eliminar:usuarios');
  }

  loadUsers() {
    this.isLoading.set(true);
    this.usersService.findAll().subscribe({
      next: (users) => {
        this.users.set(users);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  openCreateModal() {
    this.editingUserId.set(null);
    this.modal.open({ title: 'Nuevo Usuario', size: 'md' });
  }

  openEditModal(userId: string) {
    this.editingUserId.set(userId);
    this.modal.open({ title: 'Editar Usuario', size: 'md' });
  }

  closeModal() {
    this.modal.close();
  }

  onFormSuccess() {
    this.closeModal();
    this.loadUsers();
  }

  deleteUser(id: string) {
    this.userToDelete.set(id);
    this.deleteModal.open({ title: 'Confirmar Eliminación', size: 'sm' });
  }

  closeDeleteModal() {
    this.deleteModal.close();
    this.userToDelete.set(null);
  }

  confirmDelete() {
    const id = this.userToDelete();
    if (id) {
      this.usersService.remove(id).subscribe({
        next: () => {
          this.toastService.success('Usuario eliminado correctamente');
          this.closeDeleteModal();
          this.loadUsers();
        },
        error: () => {
          this.toastService.error('Error al eliminar el usuario');
          this.closeDeleteModal();
        }
      });
    }
  }

  formatDate(date: string) {
    return new Date(date).toLocaleDateString('es-ES');
  }
}
