import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { SharedInputComponent } from '../shared/components/input/input.js';
import { SharedButtonComponent } from '../shared/components/button/button.js';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    SharedInputComponent, 
    SharedButtonComponent
  ],
  template: `
    <div class="min-h-screen flex items-center justify-center bg-white p-6 font-sans antialiased text-slate-900">
      <div class="max-w-md w-full bg-white border-2 border-slate-100 p-12 rounded-[3.5rem] animate-in fade-in zoom-in duration-700">
        <div class="space-y-4 mb-12 text-center">
          <h1 class="text-4xl font-extrabold tracking-tight">Acceso</h1>
          <p class="text-slate-400 font-medium">Gestiona tu negocio de forma ordenada</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-8 flex flex-col">
          <div class="space-y-4">
            <app-shared-input label="Email" type="email" placeholder="nombre@empresa.com" [control]="getEmailControl()"></app-shared-input>
            <app-shared-input label="Contraseña" type="password" [control]="getPasswordControl()"></app-shared-input>
          </div>

          <div class="flex flex-col pt-4">
            <app-shared-button label="Entrar" type="submit" [disabled]="loginForm.invalid"></app-shared-button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  getEmailControl(): FormControl {
    return this.loginForm.get('email') as FormControl;
  }

  getPasswordControl(): FormControl {
    return this.loginForm.get('password') as FormControl;
  }

  onSubmit() {
    if (this.loginForm.valid) {
      console.log('Login minimalista exitoso:', this.loginForm.value);
    }
  }
}
