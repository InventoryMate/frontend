import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PedidosService } from '../pedidos.service';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  imports: [RouterLink,CommonModule],
  templateUrl: './detalle.component.html',
  styleUrl: './detalle.component.scss'
})
export class PedidoDetalleComponent implements OnInit{
    constructor(private router:Router,
    private pedidosService: PedidosService,
    private activatedRoute: ActivatedRoute,
    ) {}

    pedidoId:number = 0;
    routerBase= '/pedidos';
    detalles: any = {}; // Inicializado como un arreglo vacío
  ngOnInit(): void {
    this.initParams();
  }

  initParams(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.pedidoId = params['pedidoId'];
    });
    this.list();
  }

  list() {
    this.pedidosService.pedido(this.pedidoId).subscribe(
      (res) => {
        this.detalles = res; // Asignar los datos desde la API
      },
      (error) => {
        console.error('Error al obtener los datos', error);
      }
    );
  }
  

}
