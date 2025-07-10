import { Component, OnInit } from '@angular/core';
import { Router, RouterModule, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { CommonModule } from '@angular/common';
import { LoadingService } from './services/loading.service';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    CommonModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatSidenavModule,
    MatProgressSpinnerModule,
    RouterModule,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  isAuthPage: boolean = false;
  opened = true;
  constructor(
    private router: Router,
    public loadingService: LoadingService,
    private toastr: ToastrService
  ) {
    this.router.events.subscribe(() => {
      this.isAuthPage = ['login', 'register', 'forgot-password'].includes(
        this.router.url.replace('/', '')
      );
    });
  }

  title = 'InventoryMate';

  menuItems = [
    { name: 'Inicio', route: '/home', icon: 'home' },
    { name: 'Productos', route: '/productos', icon: 'box-open' },
    { name: 'Pedidos', route: '/pedidos', icon: 'cart-plus' },
    { name: 'Predicción', route: '/prediccion', icon: 'chart-line' },
  ];

  // Método para hacer logout
  logout() {
    // Limpia los datos de la sesión (como un token)
    localStorage.removeItem('authToken'); // O sessionStorage.removeItem('authToken');

    // Redirige al login
    this.router.navigate(['/login']);
  }

  isSelected(route: string): boolean {
    return this.router.url === route;
  }
  isActive(route: string): boolean {
    // Resalta si la ruta actual es igual o comienza con la ruta base (excepto rutas de login/register)
    return this.router.url === route || this.router.url.startsWith(route + '/');
  }
  navigate(route: string) {
    this.router.navigate([route]);
  }

  mostrarExito() {
    this.toastr.success('Operación exitosa', 'Éxito');
  }
  mostrarError() {
    this.toastr.error('Ocurrió un error', 'Error');
  }
}
