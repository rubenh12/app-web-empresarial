import { Injectable } from '@angular/core';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
}

@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private container: HTMLElement | null = null;

  private getContainer(): HTMLElement {
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.id = 'toast-container';
      this.container.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 999999;
        display: flex;
        flex-direction: column;
        gap: 10px;
        pointer-events: none;
      `;
      document.body.appendChild(this.container);
    }
    return this.container;
  }

  show(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration: number = 5000) {
    const container = this.getContainer();
    
    const toast = document.createElement('div');
    const colors = {
      success: '#16a34a',
      error: '#dc2626',
      warning: '#ca8a04',
      info: '#2563eb'
    };
    
    const icons = {
      success: '✓',
      error: '✕',
      warning: '⚠',
      info: 'ℹ'
    };
    
    toast.style.cssText = `
      background: ${colors[type]};
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 300px;
      max-width: 400px;
      font-family: system-ui, sans-serif;
      font-size: 14px;
      font-weight: 500;
      pointer-events: auto;
      animation: slideIn 0.3s ease-out;
    `;
    
    toast.innerHTML = `
      <span style="font-size: 18px;">${icons[type]}</span>
      <span style="flex: 1;">${message}</span>
      <button style="
        background: rgba(255,255,255,0.2);
        border: none;
        color: white;
        width: 24px;
        height: 24px;
        border-radius: 4px;
        cursor: pointer;
        font-size: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
      ">×</button>
    `;
    
    // Botón cerrar
    const closeBtn = toast.querySelector('button');
    closeBtn?.addEventListener('click', () => {
      this.remove(toast);
    });
    
    // Agregar al DOM
    container.appendChild(toast);
    
    // Auto-remove
    if (duration > 0) {
      setTimeout(() => {
        this.remove(toast);
      }, duration);
    }
    
    return toast;
  }

  private remove(toast: HTMLElement) {
    if (toast.parentElement) {
      toast.style.animation = 'slideOut 0.3s ease-in forwards';
      setTimeout(() => {
        toast.remove();
      }, 300);
    }
  }

  success(message: string, duration?: number) {
    return this.show(message, 'success', duration);
  }

  error(message: string, duration?: number) {
    return this.show(message, 'error', duration);
  }

  warning(message: string, duration?: number) {
    return this.show(message, 'warning', duration);
  }

  info(message: string, duration?: number) {
    return this.show(message, 'info', duration);
  }

  clear() {
    if (this.container) {
      this.container.innerHTML = '';
    }
  }
}
