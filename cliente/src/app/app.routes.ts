import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.js';
import { LayoutComponent } from './layout/layout.component.js';
import { HomeComponent } from './pages/home/home.component.js';
import { UsersComponent } from './users/users.component.js';
import { authGuard } from './core/guards/auth.guard.js';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { 
    path: '', 
    component: LayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'users', component: UsersComponent }
    ]
  },
  { path: '**', redirectTo: 'login' }
];
