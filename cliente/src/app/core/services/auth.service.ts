import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly baseUrl = `${(import.meta as any).env?.VITE_API_URL || 'http://localhost:3000'}/auth`;
  private _user = signal<any>(null);

  constructor(private http: HttpClient, private router: Router) {
    this.restoreSession();
  }

  user = computed(() => this._user());
  isLoggedIn = computed(() => !!this._user());
  permissions = computed(() => this._user()?.permissions || []);

  login(credentials: { email: string; password: any }) {
    return this.http.post<any>(`${this.baseUrl}/login`, credentials).pipe(
      tap(res => {
        this.saveAuth(res);
      }),
      catchError(err => throwError(() => err))
    );
  }

  logout() {
    this._user.set(null);
    localStorage.removeItem('auth_user');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    this.router.navigate(['/login']);
  }

  private saveAuth(res: any) {
    this._user.set(res.user);
    localStorage.setItem('auth_user', JSON.stringify(res.user));
    localStorage.setItem('access_token', res.access_token);
    localStorage.setItem('refresh_token', res.refresh_token);
  }

  private restoreSession() {
    const saved = localStorage.getItem('auth_user');
    if (saved) {
      this._user.set(JSON.parse(saved));
    }
  }

  hasPermission(permission: string): boolean {
    return this.permissions().includes(permission);
  }
}
