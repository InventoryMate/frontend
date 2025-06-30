import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class PedidosService {
  private apiUrl = environment.apiUrl;
  private pedidoAgregadoSource = new Subject<void>();

  pedidoAgregado$ = this.pedidoAgregadoSource.asObservable();

  constructor(private http: HttpClient) {}

  list(){
    return this.http.get<any>(`${this.apiUrl}orders`);
  }

  pedido(id: number){
    return this.http.get<any>(`${this.apiUrl}orders/${id}`);
  }
  
  productos(){
    return this.http.get<any>(`${this.apiUrl}products`);
  }

  postPedidos(data: any){
    return this.http.post<any>(`${this.apiUrl}orders`, data).pipe(
      tap(() => {
        this.pedidoAgregadoSource.next();
      })
    );
  }

}
