import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgChartsModule } from 'ng2-charts';
import { Subscription } from 'rxjs';
import { ProductosService } from '../productos/productos.service';
import { PedidosService } from '../pedidos/pedidos.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  imports: [
    FormsModule,
    CommonModule,
    NgChartsModule
  ]
})
export class HomeComponent implements OnInit, OnDestroy {
  storeName: string = '';
  totalProductos: number = 0;
  pedidosHoy: number = 0;
  productosPorVencer: number = 0;
  productosBajoStock: any[] = [];
  alertas: string[] = [];
  ultimasActividades: string[] = [];
  gananciasHoy: number = 0;
  gananciasSemana: number = 0;
  gananciasMes: number = 0;

  private pedidoSubscription!: Subscription;

  constructor(
    private http: HttpClient, 
    private productosService: ProductosService,
    private pedidosService: PedidosService
  ) {}

  ngOnInit(): void {
    const user = localStorage.getItem('user');
    if (user) {
      this.storeName = JSON.parse(user);
    }
    this.loadAllData();

    this.pedidoSubscription = this.pedidosService.pedidoAgregado$.subscribe(() => {
      this.loadAllData();
    });
  }

  ngOnDestroy(): void {
    if (this.pedidoSubscription) {
      this.pedidoSubscription.unsubscribe();
    }
  }

  loadAllData(): void {
    this.cargarKPIs();
    this.cargarGanancias();
    this.cargarUltimasActividades();
  }

  cargarKPIs() {
    this.productosService.list().subscribe((productos: any[]) => {
      this.totalProductos = productos.length;
      // Productos por vencer (expirables, con stock y fecha de expiración <= 7 días)
      let porVencer = 0;
      let bajoStock: any[] = [];
      productos.forEach(prod => {
        if (prod.expirable && Array.isArray(prod.stocks)) {
          const hoy = new Date();
          prod.stocks.forEach((stock: any) => {
            if (stock.expirationDate) {
              const exp = new Date(stock.expirationDate);
              const diff = (exp.getTime() - hoy.getTime()) / (1000*60*60*24);
              if (diff >= 0 && diff <= 7 && stock.quantity > 0) porVencer++;
            }
          });
        }
        // Bajo stock (ejemplo: menos de 5 unidades)
        const totalStock = Array.isArray(prod.stocks) ? prod.stocks.reduce((acc: number, s: any) => acc + (s.quantity || 0), 0) : 0;
        if (totalStock > 0 && totalStock < 5) {
          bajoStock.push(prod.productName + ' (Stock: ' + totalStock + ')');
        }
      });
      this.productosPorVencer = porVencer;
      this.productosBajoStock = bajoStock;
      // Actualizar alertas
      this.alertas = [];
      this.productosBajoStock.forEach(p => this.alertas.push('Bajo stock: ' + p));
      if (this.productosPorVencer > 0) this.alertas.push('Hay ' + this.productosPorVencer + ' productos próximos a vencer');
    });
    this.pedidosService.list().subscribe((pedidos: any[]) => {
      const hoy = new Date();
      this.pedidosHoy = pedidos.filter(p => {
        const fecha = new Date(p.orderDate);
        return fecha.getFullYear() === hoy.getFullYear() &&
               fecha.getMonth() === hoy.getMonth() &&
               fecha.getDate() === hoy.getDate();
      }).length;
    });
  }

  cargarGanancias() {
    this.pedidosService.list().subscribe((pedidos: any[]) => {
      if (!pedidos) return;

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(today);
      weekStart.setDate(weekStart.getDate() - today.getDay()); // Asume que la semana empieza en Domingo
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

      this.gananciasHoy = pedidos
        .filter(p => {
          const orderDate = new Date(p.orderDate);
          return orderDate.getFullYear() === today.getFullYear() &&
                 orderDate.getMonth() === today.getMonth() &&
                 orderDate.getDate() === today.getDate();
        })
        .reduce((acc, p) => acc + (p.totalPrice || 0), 0);

      this.gananciasSemana = pedidos
        .filter(p => new Date(p.orderDate) >= weekStart)
        .reduce((acc, p) => acc + (p.totalPrice || 0), 0);

      this.gananciasMes = pedidos
        .filter(p => new Date(p.orderDate) >= monthStart)
        .reduce((acc, p) => acc + (p.totalPrice || 0), 0);
    });
  }

  cargarUltimasActividades() {
    // Últimos 3 pedidos y productos agregados (por fecha)
    const actividades: string[] = [];
    this.pedidosService.list().subscribe((pedidos: any[]) => {
      const ultimosPedidos = pedidos
        .sort((a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime())
        .slice(0, 3);
      ultimosPedidos.forEach(p => {
        actividades.push(`Pedido #${p.id} registrado el ${new Date(p.orderDate).toLocaleDateString()}`);
      });
      this.productosService.list().subscribe((productos: any[]) => {
        const ultimosProductos = productos
          .sort((a, b) => new Date(b.createdAt || b.updatedAt || 0).getTime() - new Date(a.createdAt || a.updatedAt || 0).getTime())
          .slice(0, 3);
        ultimosProductos.forEach(prod => {
          actividades.push(`Producto ${prod.productName} agregado/modificado recientemente`);
        });
        // Solo mostrar las 3 actividades más recientes
        this.ultimasActividades = actividades.slice(0, 3);
      });
    });
  }
}
