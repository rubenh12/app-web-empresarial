import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { SharedButtonComponent } from '../../shared/components/button/button';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SharedButtonComponent],
  template: `
    <div class="space-y-8">
      <!-- Welcome Section -->
      <div class="bg-white rounded-lg shadow-md p-8">
        <div class="text-center">
          <div class="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 mx-auto mb-6">
            <svg class="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <h2 class="text-3xl font-bold text-gray-900 mb-4">
            Bienvenido al Panel Maestro
          </h2>
          <p class="text-gray-600 max-w-2xl mx-auto mb-8">
            Este es tu centro de operaciones empresariales. Los datos y acciones disponibles dependen directamente de tus permisos de administrador.
          </p>
          
          <!-- Quick Actions -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <app-shared-button
              *ngIf="auth.hasPermission('ver:usuarios')"
              label="Ver Usuarios"
              (click)="navigateToUsers()"
              type="button"
            />
          </div>
        </div>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-blue-100 rounded-lg p-3">
              <svg class="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Usuarios Activos</dt>
                <dd class="text-lg font-medium text-gray-900">--</dd>
              </dl>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-green-100 rounded-lg p-3">
              <svg class="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Sistema Online</dt>
                <dd class="text-lg font-medium text-gray-900">Activo</dd>
              </dl>
            </div>
          </div>
        </div>

        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex items-center">
            <div class="flex-shrink-0 bg-purple-100 rounded-lg p-3">
              <svg class="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <div class="ml-5 w-0 flex-1">
              <dl>
                <dt class="text-sm font-medium text-gray-500 truncate">Última Actividad</dt>
                <dd class="text-lg font-medium text-gray-900">Ahora</dd>
              </dl>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HomeComponent {
  auth = inject(AuthService);
  router = inject(Router);

  navigateToUsers() {
    this.router.navigate(['/users']);
  }

  navigateToCreateUser() {
    this.router.navigate(['/users/create']);
  }
}
