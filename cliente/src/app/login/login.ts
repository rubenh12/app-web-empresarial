import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service.js';
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
          <p class="text-slate-400 font-medium">Gestiona proyectos empresariales</p>
        </div>

        <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" class="space-y-8 flex flex-col">
          <div class="space-y-4">
            <app-shared-input label="Correo" type="email" placeholder="nombre@gmail.com" [control]="getEmailControl()"></app-shared-input>
            <app-shared-input label="Contraseña" type="password" [control]="getPasswordControl()"></app-shared-input>
          </div>

          <div class="flex flex-col pt-4">
            <app-shared-button 
              [label]="isLoading ? 'Entrando...' : 'Entrar'" 
              type="submit" 
              [disabled]="loginForm.invalid || isLoading"
              [fullWidth]="true"
            ></app-shared-button>
          </div>
          <div *ngIf="error" class="text-red-500 text-[13px] font-semibold text-center mt-4">
            {{ error }}
          </div>
        </form>
      </div>
    </div>
  `
})
export class LoginComponent {
  loginForm: FormGroup;
  isLoading = false;
  error = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(1)]]
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
      this.isLoading = true;
      this.error = '';
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.router.navigate(['/home']);
        },
        error: (err) => {
          this.isLoading = false;
          if (err?.status === 0 || err?.message === 'Request Timeout') {
            this.error = '';
          } else {
            this.error = 'Credenciales inválidas';
          }
          this.cdr.detectChanges();
        }
      });
    }
  }
}
