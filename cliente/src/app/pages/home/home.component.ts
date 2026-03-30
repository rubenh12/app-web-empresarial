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
    <div class="h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full space-y-8 bg-white p-10 rounded-3xl border border-slate-100 shadow-xl shadow-slate-200/50 text-center animate-fade-in">
        <div>
          <div class="mx-auto h-24 w-24 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-6 group hover:bg-blue-600 hover:text-white transition-all duration-300 shadow-inner">
            <svg class="h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
          </div>
          <h2 class="text-3xl font-extrabold text-slate-900 tracking-tight">
            ¡Bienvenido de nuevo!
          </h2>
          <div class="mt-6 space-y-2 mb-8">
            <p class="text-2xl font-bold text-blue-600">
              {{ auth.user()?.name }}
            </p>
            <p class="text-slate-500 font-medium">
              {{ auth.user()?.email }}
            </p>
          </div>

          <div class="grid grid-cols-1 gap-3 pt-6 border-t border-slate-50">
            <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Accesos Rápidos</p>
            <div class="flex flex-wrap justify-center gap-2">
              <app-shared-button 
                *ngIf="auth.hasPermission('VER_USUARIOS')"
                label="Usuarios" 
                (click)="navigateTo('users')" 
                variant="secondary"
                size="sm"
              />
              <app-shared-button 
                *ngIf="auth.hasPermission('CREAR_USUARIOS') || auth.hasPermission('ACTUALIZAR_USUARIOS') || auth.hasPermission('ELIMINAR_USUARIOS')"
                label="Roles" 
                (click)="navigateTo('roles')" 
                variant="secondary"
                size="sm"
              />
              <app-shared-button 
                *ngIf="auth.hasPermission('VER_CLIENTES')"
                label="Clientes" 
                (click)="navigateTo('clients')" 
                variant="secondary"
                size="sm"
              />
              <app-shared-button 
                *ngIf="auth.hasPermission('VER_PROYECTOS') || auth.hasPermission('VER_PROYECTOS_ASIGNADOS')"
                label="Proyectos" 
                (click)="navigateTo('projects')" 
                variant="secondary"
                size="sm"
              />
              <app-shared-button 
                *ngIf="auth.hasPermission('VER_TAREAS')"
                label="Tareas" 
                (click)="navigateTo('tasks')" 
                variant="secondary"
                size="sm"
              />
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

  navigateTo(path: string) {
    this.router.navigate([`/${path}`]);
  }
}
