import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface ModalOptions {
  title: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnOverlay?: boolean;
}

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      *ngIf="isOpen()"
      class="fixed inset-0 z-50 overflow-y-auto"
      (click)="onOverlayClick($event)"
    >
      <div class="flex min-h-screen items-center justify-center p-4">
        <!-- Overlay -->
        <div class="fixed inset-0 bg-black bg-opacity-50 transition-opacity"></div>
        
        <!-- Modal -->
        <div 
          [class]="getModalClasses()"
          class="relative z-10 bg-white rounded-lg shadow-xl transform transition-all"
          (click)="$event.stopPropagation()"
        >
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 class="text-lg font-semibold text-gray-900">{{ options().title }}</h3>
            <button 
              (click)="close()"
              class="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
          
          <!-- Body -->
          <div class="p-6">
            <ng-content></ng-content>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ModalComponent {
  isOpen = signal(false);
  options = signal<ModalOptions>({ title: '' });

  open(options: ModalOptions) {
    this.options.set(options);
    this.isOpen.set(true);
    document.body.style.overflow = 'hidden';
  }

  close() {
    this.isOpen.set(false);
    document.body.style.overflow = '';
  }

  onOverlayClick(event: MouseEvent) {
    if (this.options().closeOnOverlay !== false) {
      this.close();
    }
  }

  getModalClasses(): string {
    const size = this.options().size || 'md';
    const baseClasses = 'relative z-10 bg-white rounded-lg shadow-xl transform transition-all w-full';
    
    const sizeClasses = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl'
    };

    return `${baseClasses} ${sizeClasses[size]}`;
  }
}
