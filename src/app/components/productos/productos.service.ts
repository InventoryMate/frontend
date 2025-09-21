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

  updateProducto(id: number, data: any) {
    return this.http.put<any>(`${this.apiUrl}products/${id}`, data);
  }

  deleteProducto(id: number) {
    return this.http.delete<any>(`${this.apiUrl}products/${id}`);
  }

  updateCategoria(id: number, data: any) {
    return this.http.put<any>(`${this.apiUrl}categories/${id}`, data);
  }

  deleteCategoria(id: number) {
    return this.http.delete<any>(`${this.apiUrl}categories/${id}`);
  }

}
