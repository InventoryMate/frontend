import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { loadingInterceptor } from './loading.interceptor';
import { authInterceptor } from './interceptors/auth-interceptor.service';
import { importProvidersFrom } from '@angular/core';
import { ToastrModule } from 'ngx-toastr';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([loadingInterceptor, authInterceptor])),
    importProvidersFrom(BrowserAnimationsModule),
    importProvidersFrom(ToastrModule.forRoot({
      positionClass: 'toast-bottom-right',
      timeOut: 3000,
      preventDuplicates: true,
    })),
  ]
};
