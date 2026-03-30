import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';
import { ToastService } from '../services/toast.service.js';

export const timeoutInterceptor: HttpInterceptorFn = (req, next) => {
  const toast = inject(ToastService);
  const TIME_OUT_MS = 8000;

  return next(req).pipe(
    timeout(TIME_OUT_MS),
    catchError((error) => {
      if (error instanceof TimeoutError || error.name === 'TimeoutError') {
        toast.error(`La petición tardó demasiado en responder (más de ${TIME_OUT_MS / 1000}s). Por favor, intenta de nuevo.`);
      } else if (error.status === 0) {
        toast.error('No se pudo conectar con el servidor. Verifica tu conexión de internet o intenta más tarde.');
      }
      return throwError(() => error);
    })
  );
};
