import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormControl } from '@angular/forms';

@Component({
  selector: 'app-shared-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="flex flex-col gap-1.5 w-full group">
      <label *ngIf="label" class="text-[13px] font-semibold text-slate-500 ml-1 tracking-tight group-focus-within:text-blue-600 transition-colors">
        {{ label }}
      </label>
      <input
        [formControl]="control"
        [type]="type"
        [placeholder]="placeholder"
        class="w-full px-5 h-14 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none transition-all duration-300
               focus:border-blue-500 focus:bg-white focus:shadow-lg focus:shadow-blue-500/5 placeholder:text-slate-300"
      />
      <span *ngIf="control.touched && control.invalid" class="text-[11px] text-red-500 ml-1 animate-in fade-in slide-in-from-top-1">
        Campo requerido o inválido
      </span>
    </div>
  `
})
export class SharedInputComponent {
  @Input() label: string = '';
  @Input() type: string = 'text';
  @Input() placeholder: string = '';
  @Input() control!: FormControl;
}
