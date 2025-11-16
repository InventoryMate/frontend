import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-login',
  imports: [
        FormsModule,
        CommonModule,
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit() {

    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('storeId');

    this.authService.login(this.email, this.password).subscribe(
      (response) => {
        console.log('Login exitoso', response);
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('user', JSON.stringify(response.storeName));
        localStorage.setItem('storeId', response.id);
        this.router.navigate(['/home']);
      },
      (error) => {
        console.error('Credenciales incorrectas', error);
        alert('Correo electrónico o contraseña incorrectos.');
      }
    );
  }

  onRegister() {
    this.router.navigate(['/register']);
  } 
  
  onForgotPassword() {
    this.router.navigate(['/forgot-password']);
  } 

}
