import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsersService, User } from '../core/services/users.service';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';
import { SharedButtonComponent } from '../shared/components/button/button';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, SharedButtonComponent],
  template: `
    <div class="container mx-auto p-6">
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-3xl font-bold">Usuarios</h1>
        <app-shared-button 
          *ngIf="canCreateUsers"
          label="Nuevo Usuario" 
          (click)="navigateToCreate()"
          type="button"
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
                  (click)="navigateToEdit(user.id)"
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
    </div>
  `
})
export class UsersComponent implements OnInit {
  users = signal<User[]>([]);
  isLoading = signal(true);

  constructor(
    private usersService: UsersService,
    private authService: AuthService,
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

  navigateToCreate() {
    this.router.navigate(['/users/create']);
  }

  navigateToEdit(id: string) {
    this.router.navigate(['/users/edit', id]);
  }

  deleteUser(id: string) {
    if (confirm('¿Estás seguro de eliminar este usuario?')) {
      this.usersService.remove(id).subscribe({
        next: () => {
          this.loadUsers();
        }
      });
    }
  }

  formatDate(date: string) {
    return new Date(date).toLocaleDateString('es-ES');
  }
}
