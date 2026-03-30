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
      class="w-full h-14 rounded-2xl font-bold tracking-tight text-white transition-all transform active:scale-95
             disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed
             bg-slate-900 hover:bg-black hover:shadow-xl hover:shadow-slate-500/10 shadow-lg shadow-slate-900/5 mt-2"
    >
      {{ label }}
    </button>
  `
})
export class SharedButtonComponent {
  @Input() label: string = 'Botón';
  @Input() type: 'button' | 'submit' = 'button';
  @Input() disabled: boolean = false;
  @Output() onClick = new EventEmitter<MouseEvent>();
}
