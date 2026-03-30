import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.js';
import { DashboardComponent } from './dashboard/dashboard.js';
import { UsersComponent } from './users/users.component.js';
import { UserFormComponent } from './users/user-form.component.js';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'users', 
    component: UsersComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'users/create', 
    component: UserFormComponent,
    canActivate: [authGuard]
  },
  { 
    path: 'users/edit/:id', 
    component: UserFormComponent,
    canActivate: [authGuard]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: '**', redirectTo: 'login' }
];
