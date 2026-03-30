import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `
    <div class="min-h-screen bg-gray-50">
      <nav class="bg-white shadow-md border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">
            <!-- Logo -->
            <div class="flex items-center">
              <h1 class="text-2xl font-bold text-gray-900">
                Empresa <span class="text-blue-600">2026</span>
              </h1>
            </div>

            <!-- Navigation Links -->
            <div class="hidden md:flex items-center space-x-4">
              <button 
                *ngIf="auth.hasPermission('ver:usuarios')"
                (click)="navigateToUsers()"
                class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                Usuarios
              </button>
              <button 
                *ngIf="auth.hasPermission('ver:usuarios')"
                (click)="navigateToRoles()"
                class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                Roles
              </button>
              <button 
                *ngIf="auth.hasPermission('ver:clientes')"
                (click)="navigateToClients()"
                class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
               >
                Clientes
              </button>
              <button 
                *ngIf="auth.hasPermission('ver:proyectos')"
                (click)="navigateToProjects()"
                class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                Proyectos
              </button>
              <button 
                *ngIf="auth.hasPermission('ver:tareas')"
                (click)="navigateToTasks()"
                class="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
              >
                Tareas
              </button>
            </div>

            <!-- User Menu -->
            <div class="flex items-center space-x-4">
              <div class="hidden md:flex flex-col items-end">
                <span class="text-sm font-medium text-gray-900">{{ auth.user()?.name }}</span>
                <span class="text-xs text-gray-500">{{ auth.user()?.role }}</span>
              </div>
              
              <div class="md:hidden">
                <button 
                  (click)="toggleMobileMenu()"
                  class="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                >
                  <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
                  </svg>
                </button>
              </div>
              
              <button 
                *ngIf="!mobileMenuOpen"
                (click)="auth.logout()"
                class="hidden md:block px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Salir
              </button>
            </div>
          </div>

          <!-- Mobile menu -->
          <div *ngIf="mobileMenuOpen" class="md:hidden border-t border-gray-200 pt-4 pb-3">
            <div class="space-y-1">
              <button 
                *ngIf="auth.hasPermission('ver:usuarios')"
                (click)="navigateToUsers(); toggleMobileMenu()"
                class="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                Usuarios
              </button>
              <button 
                *ngIf="auth.hasPermission('ver:usuarios')"
                (click)="navigateToRoles(); toggleMobileMenu()"
                class="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                Roles
              </button>
              <button 
                *ngIf="auth.hasPermission('ver:clientes')"
                (click)="navigateToClients(); toggleMobileMenu()"
                class="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                Clientes
              </button>
              <button 
                *ngIf="auth.hasPermission('ver:proyectos')"
                (click)="navigateToProjects(); toggleMobileMenu()"
                class="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                Proyectos
              </button>
              <button 
                *ngIf="auth.hasPermission('ver:tareas')"
                (click)="navigateToTasks(); toggleMobileMenu()"
                class="block w-full text-left px-4 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100"
              >
                Tareas
              </button>
            </div>
            
            <div class="border-t border-gray-200 pt-3 mt-3">
              <div class="px-4 py-2">
                <div class="text-base font-medium text-gray-900">{{ auth.user()?.name }}</div>
                <div class="text-sm text-gray-500">{{ auth.user()?.role }}</div>
              </div>
              <button 
                (click)="auth.logout()"
                class="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <router-outlet></router-outlet>
      </main>
    </div>
  `
})
export class LayoutComponent {
  auth = inject(AuthService);
  router = inject(Router);
  mobileMenuOpen = false;

  navigateToUsers() {
    this.router.navigate(['/users']);
  }

  navigateToRoles() {
    this.router.navigate(['/roles']);
  }

  navigateToClients() {
    this.router.navigate(['/clients']);
  }

  navigateToProjects() {
    this.router.navigate(['/projects']);
  }

  navigateToTasks() {
    this.router.navigate(['/tasks']);
  }

  navigateToCreateUser() {
    this.router.navigate(['/users/create']);
  }

  toggleMobileMenu() {
    this.mobileMenuOpen = !this.mobileMenuOpen;
  }
}
