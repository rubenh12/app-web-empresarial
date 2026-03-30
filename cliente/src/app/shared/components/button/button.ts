import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shared-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      [type]="type"
      [disabled]="disabled"
      (click)="onClick.emit($event)"
      [class]="getButtonClasses()"
    >
      {{ label }}
    </button>
  `
})
export class SharedButtonComponent {
  @Input() label: string = 'Botón';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled: boolean = false;
  @Input() variant: 'primary' | 'secondary' | 'success' | 'danger' = 'primary';
  @Input() fullWidth: boolean = false;
  @Output() onClick = new EventEmitter<MouseEvent>();

  getButtonClasses(): string {
    const baseClasses = this.fullWidth 
      ? 'w-full px-6 py-3 h-14 rounded-2xl font-bold tracking-tight text-white transition-all transform active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed'
      : 'px-6 py-3 h-14 rounded-2xl font-bold tracking-tight text-white transition-all transform active:scale-95 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed';
    
    switch (this.variant) {
      case 'primary':
        return `${baseClasses} bg-slate-900 hover:bg-black hover:shadow-xl hover:shadow-slate-500/10 shadow-lg shadow-slate-900/5`;
      case 'secondary':
        return `${baseClasses} bg-blue-600 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/10 shadow-lg shadow-blue-900/5`;
      case 'success':
        return `${baseClasses} bg-green-600 hover:bg-green-700 hover:shadow-xl hover:shadow-green-500/10 shadow-lg shadow-green-900/5`;
      case 'danger':
        return `${baseClasses} bg-red-600 hover:bg-red-700 hover:shadow-xl hover:shadow-red-500/10 shadow-lg shadow-red-900/5`;
      default:
        return `${baseClasses} bg-slate-900 hover:bg-black hover:shadow-xl hover:shadow-slate-500/10 shadow-lg shadow-slate-900/5`;
    }
  }
}
