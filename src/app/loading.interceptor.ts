import { HttpInterceptorFn } from '@angular/common/http';
import { delay, finalize } from 'rxjs/operators';
import { LoadingService } from './services/loading.service';
import { inject } from '@angular/core';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loadingService = inject(LoadingService);
  setTimeout(() => loadingService.show(), 0);
  return next(req).pipe(
    delay(2), // Simula 2 segundos de carga
    finalize(() => loadingService.hide())
  );

};
