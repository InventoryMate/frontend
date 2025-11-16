import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Chart, ChartConfiguration, ChartOptions } from 'chart.js';
import { NgChartsModule } from 'ng2-charts';
import {PrediccionDemandaService} from './prediccion-demanda.service';
import { ProductosService } from '../productos/productos.service'; // Servicio de productos importado

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
  showGuide: boolean = false; 
  storeId: number = 0;
  chartWrapperWidth = 600;
  barChartLabels: string[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];
  barChartData: any[] = [];
  barChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      title: {
        display: true,
        text: 'Resumen de Ventas Semanales',
        font: {
          size: 30
        }
      }
    }
  };

  hasProducts: boolean = false;
  barChartConfig: ChartConfiguration<'bar'>['data'] = {
    labels: this.barChartLabels,
    datasets: []
  };

  predictionDays: number = 0;
  showPredictionChart = false;

  predictionChartLabels: string[] = [];
  predictionChartOptions: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: true },
      title: {
        display: true,
        text: 'Predicción de Demanda',
        font: {
          size: 30
        }
      }
    }
  };
  predictionChartConfig: ChartConfiguration<'bar'>['data'] = {
    labels: [],
    datasets: []
  };

  constructor(
    private http: HttpClient, 
    private prediccionDemandaService: PrediccionDemandaService,
    private productosService: ProductosService

  ) {}

  ngOnInit(): void {
    const storeIdString = localStorage.getItem('storeId');
    if (storeIdString) {
      this.storeId = Number(storeIdString);
    }
    this.checkIfProductsExist();
  }

  toggleGuide(): void { 
    this.showGuide = !this.showGuide;
  }

  checkIfProductsExist(): void {
    this.productosService.list().subscribe({
      next: (products: any[]) => {
        this.hasProducts = products && products.length > 0;
        if (this.hasProducts) {
          this.loadWeeklySalesChart();
        }
      },
      error: (error) => {
        console.error('Error al verificar la existencia de productos', error);
        this.hasProducts = false;
      }
    });
  }

  loadWeeklySalesChart(): void {
    this.prediccionDemandaService.historialVentas().subscribe((ventas) => {
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

  predictDemand(): void {
    this.prediccionDemandaService.predecirDemanda(this.storeId,this.predictionDays).subscribe((prediction: any) => {
      const predictions = prediction.predictions;
      if (predictions && predictions.length > 0) {
        const labels = predictions[0].daily_predictions.map((daily: any) => {
          const date = new Date(daily.date);
          return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
        });
        
        this.predictionChartConfig = {
          labels: labels,
          datasets: predictions.map((producto: any, idx: number) => ({
            label: producto.product_id,
            data: producto.daily_predictions.map((p: any) => p.predicted_quantity),
            backgroundColor: this.getColor(idx + 5),
            borderRadius: 6,
            maxBarThickness: 32
          }))
        };
        this.showPredictionChart = true;
      }
    });
  }

  getColor(idx: number): string {
    const colors = [
      '#42A5F5', '#66BB6A', '#FFA726', '#AB47BC', '#EC407A', '#FF7043', '#26A69A', '#D4E157', '#8D6E63', '#789262'
    ];
    return colors[idx % colors.length];
  }
}
