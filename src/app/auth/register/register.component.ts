import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-register',
  imports: [
        FormsModule,
        CommonModule,
  ],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent {
  storeName: string = '';
  name: string = '';
  email: string = '';
  password: string = '';
  confirmPassword: string = '';

    constructor(private authService: AuthService, private router: Router) {}
  
    onSubmit() {
      if (this.password !== this.confirmPassword) {
        alert('Las contraseñas no coinciden.');
        return;
      }
  
      this.authService.register(this.email, this.password, this.storeName).subscribe(
        (response) => {
          console.log('Registro exitoso:', response);
          alert('Cuenta creada exitosamente.');
          this.router.navigate(['/login']);
        },
        (error) => {
          console.error('Error en el registro:', error);
          alert('Hubo un problema al crear la cuenta.');
        }
      );
    }

  onLogin() {
    this.router.navigate(['/login']);
  }

}
