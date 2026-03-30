import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { ToastService } from '../services/toast.service.js';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = localStorage.getItem('access_token');
  const toast = inject(ToastService);

  let authReq = req;
  if (token) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      const isLogin = req.url.includes('/auth/login');

      if (!isLogin) {
        if (error.status === 401) {
          toast.error('Sesión expirada. Regresando al login...');
        } else if (error.status === 403) {
          toast.error('No tienes permisos suficientes para realizar esta acción');
        }
      }
      return throwError(() => error);
    })
  );
};
