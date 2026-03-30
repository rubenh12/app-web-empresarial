import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service.js';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');
  const toast = inject(ToastService);
  const router = inject(Router);

  let authReq = req;
  if (token) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLogin = req.url.includes(`${environment.apiUrl}/auth/login`);

      if (!isLogin) {
        if (error.status === 401) {
          toast.error('Sesión expirada. Regresando al login...');
          localStorage.clear();
          router.navigate(['/login']);
        } else if (error.status === 403) {
          toast.error('Permisos insuficientes. Regresando al login...');
          localStorage.clear();
          router.navigate(['/login']);
        }
      }
      return throwError(() => error);
    })
  );
};
