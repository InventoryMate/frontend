import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import {PrediccionDemandaService} from './prediccion-demanda.service';
@Component({
  selector: 'app-prediccion-demanda',
  templateUrl: './prediccion-demanda.component.html',
  styleUrls: ['./prediccion-demanda.component.scss'],
  imports: [
    FormsModule,
    CommonModule,
    NgChartsModule
  ]
})
export class PrediccionDemandaComponent {
  chartWrapperWidth = 600;
  barChartLabels: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  barChartData: any[] = [];
  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    plugins: {
      legend: { display: true },
    }
  };
  barChartConfig: ChartConfiguration<'bar'>['data'] = {
    labels: this.barChartLabels,
    datasets: []
  };

  constructor(
    private http: HttpClient, 
    private prediccionDemandaService: PrediccionDemandaService
  ) {}

  ngOnInit(): void {
    this.loadWeeklySalesChart();
  }

  loadWeeklySalesChart(): void {
    this.prediccionDemandaService.historialVentas().subscribe((ventas) => {
      // Cada producto será una serie (dataset)
      this.barChartConfig = {
        labels: this.barChartLabels,
        datasets: ventas.map((producto: any, idx: number) => ({
          label: producto.productName,
          data: [
            producto.dailySales.lunes,
            producto.dailySales.martes,
            producto.dailySales.miércoles,
            producto.dailySales.jueves,
            producto.dailySales.viernes,
            producto.dailySales.sábado,
            producto.dailySales.domingo
          ],
          backgroundColor: this.getColor(idx),
          borderRadius: 6,
          maxBarThickness: 32
        }))
      };
    });
  }

  getColor(idx: number): string {
    // Paleta simple, puedes mejorarla
    const colors = [
      '#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#EC407A', '#FF7043', '#26A69A', '#D4E157', '#8D6E63', '#789262'
    ];
    return colors[idx % colors.length];
  }
}
