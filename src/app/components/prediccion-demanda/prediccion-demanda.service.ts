import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class PrediccionDemandaService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  productList(){
    return this.http.get<any[]>(`${this.apiUrl}products`);
  }

  historialVentas() {
    return this.http.post<any[]>(`${this.apiUrl}orders/weekly-sales`, {});
  }

}
