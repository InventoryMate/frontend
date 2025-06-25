import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // Función para obtener el token del localStorage
  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }

  login(username: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}auth/login`, { username, password });
  }

  register(username: string, password: string, storeName: string): Observable<any> {
    return this.http.post(`${this.apiUrl}auth/register-store`, { username, password, storeName });
  }

  isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  logout(): void {
    localStorage.removeItem('authToken');
  }
}
