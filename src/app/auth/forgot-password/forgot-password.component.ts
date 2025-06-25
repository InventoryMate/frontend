import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  imports: [
        FormsModule,
        CommonModule,
  ],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss'
})
export class ForgotPasswordComponent {
  email: string = '';

  constructor(private router: Router) {}
  

  onSubmit() {
    console.log('Recuperar contraseña para:', this.email);
    // Agregar lógica de recuperación de contraseña
  }

  onLogin() {
    this.router.navigate(['/login']);
  }

}
