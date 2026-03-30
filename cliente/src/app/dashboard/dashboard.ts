import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service.js';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="min-h-screen bg-white font-sans antialiased text-slate-900 flex flex-col p-8">
      <nav class="flex items-center justify-between h-20 border-b border-slate-100 mb-12">
        <h1 class="text-2xl font-black tracking-tight uppercase">Empresa <span class="text-blue-600">2026</span></h1>
        
        <div class="flex items-center gap-6">
          <!-- Botones de navegación según permisos -->
          <button 
            *ngIf="auth.hasPermission('VER_USUARIOS')"
            (click)="navigateToUsers()"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl transition-all active:scale-95"
          >
            Ver Usuarios
          </button>
          
          <button 
            *ngIf="auth.hasPermission('CREAR_USUARIOS')"
            (click)="navigateToCreateUser()"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-xl transition-all active:scale-95"
          >
            Nuevo Usuario
          </button>

          <div class="flex flex-col items-end">
            <span class="text-sm font-bold tracking-tight">{{ auth.user()?.name }}</span>
            <span class="text-[11px] text-slate-400 font-bold uppercase tracking-widest">{{ auth.user()?.role }}</span>
          </div>
          <button (click)="auth.logout()" class="px-6 h-12 bg-slate-900 hover:bg-black text-white text-sm font-bold rounded-2xl transition-all active:scale-95">
            Salir
          </button>
        </div>
      </nav>

      <main class="flex-1">
        <div class="md:col-span-2 p-12 border-2 border-slate-100 rounded-[3.5rem] flex flex-col items-center justify-center text-center space-y-6">
          <div class="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-blue-600 mb-2">
            <span class="text-3xl font-black italic">!</span>
          </div>
          <h2 class="text-3xl font-extrabold tracking-tight">Bienvenido al Panel Maestro</h2>
          <p class="text-slate-400 max-w-sm leading-relaxed">Este es tu centro de operaciones empresariales. Los datos que ves dependen directamente de tus permisos de administrador.</p>
        </div>
      </main>
    </div>
  `
})
export class DashboardComponent {
  auth = inject(AuthService);
  router = inject(Router);

  navigateToUsers() {
    this.router.navigate(['/users']);
  }

  navigateToCreateUser() {
    this.router.navigate(['/users/create']);
  }
}
