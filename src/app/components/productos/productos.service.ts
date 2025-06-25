import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class ProductosService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  list(){
    return this.http.get<any>(`${this.apiUrl}products`);
  }

  categorias(){
    return this.http.get<any>(`${this.apiUrl}categories`);
  }

  postProducto(data: any){
    return this.http.post<any>(`${this.apiUrl}products`, data);
  }

  stock(id: number){
    return this.http.get<any>(`${this.apiUrl}products/${id}/stocks`);
  }

  postStock(productId: number, data: any){
    return this.http.post<any>(`${this.apiUrl}products/${productId}/stocks`, data);
  }

  postCategoria(data: any){
    return this.http.post<any>(`${this.apiUrl}categories`, data);
  }

}
