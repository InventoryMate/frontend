import { Component, OnInit, ViewChild } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { PedidosService } from './pedidos.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-pedidos',
  imports: [
    FormsModule,
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    
  ],
  templateUrl: './pedidos.component.html',
  styleUrl: './pedidos.component.scss',
})
export class PedidosComponent implements OnInit {
  constructor(private router: Router, private pedidosService: PedidosService, private toastr: ToastrService) {}

  displayedColumns: string[] = ['#', 'Fecha', 'Precio'];
  routerNuevo = '/pedidos/nuevo';
  routerDetalle = '/pedidos/';

  toggleAddModal: boolean = false;
  form: FormGroup = new FormGroup({});

  productos: any[] = []; // Inicializado como un arreglo vacío
  filteredData: any[] = [];
  filteredDataOriginal: any[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0;
  isFilterOpen: boolean = false;

 // Campos dinámicos
 selectedField: string = ''; // Campo seleccionado (nombre, cantidad, etc.)
 filterValue: string = ''; // Valor del filtro para campos como nombre o precio
 selectedCategory: string = ''; // Categoría seleccionada
 filterDate: string = '';

 isModalOpen = false;


  ngOnInit(): void {
    this.list();
  }

  list() {
    this.pedidosService.list().subscribe(
      (data: any[]) => {
        this.filteredData = data || [];
        this.filteredDataOriginal = [...this.filteredData];
        this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
      },
      (error) => {
        console.error('Error al obtener los datos', error);
      }
    );
  }

  viewDetails(i:number) {
    this.router.navigate([this.routerDetalle + i]);
  }

  productosList() {
    this.pedidosService.productos().subscribe(
      (res) => {
        this.productos = res; 
      },
      (err) => {
        console.error('Error al obtener las productos', err);
      }
    );
  }

 onFieldSelect() {
  // Reinicia el valor del filtro al seleccionar un nuevo campo
  this.filterValue = '';
  this.selectedCategory = '';
}

  toggleFilter() {
    this.isFilterOpen = !this.isFilterOpen;
  }

  applyFilters() {
    this.currentPage = 1;
    let filtered = this.filteredDataOriginal;
    if (this.filterDate) {
      filtered = filtered.filter((item) => {
        const itemDate = new Date(item.orderDate);
        const filterDate = new Date(this.filterDate);
        return itemDate.getFullYear() === filterDate.getFullYear() &&
               itemDate.getMonth() === filterDate.getMonth() &&
               itemDate.getDate() === filterDate.getDate();
      });
    }
    this.filteredData = filtered;

    if (this.selectedField === 'Fecha') {
      this.filteredData = this.filteredData.filter((item) =>
        item.productName.toLowerCase().includes(this.filterValue.toLowerCase())
      );
    } else {
      this.filteredData = [...this.filteredData]; // Sin filtros
    }

    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    this.toggleFilter();
  }
  
  filterByCategory() {
    this.currentPage = 1;

    if (this.selectedCategory === '') {
      this.filteredData = [...this.filteredData]; // Mostrar todos los elementos
    }

    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
  }
  
  
  addPedido() {
    this.isModalOpen = true;
    this.toggleAddModal = true;
    this.initForm();
    this.productosList(); // Obtener la lista de productos al abrir el modal
  }

  initForm() {
    this.form = new FormGroup({
      orderDetails: new FormArray([
        this.createProductForm()
      ])
    });
  }
  
  createProductForm(): FormGroup {
    return new FormGroup({
      productId: new FormControl(null, Validators.required),
      quantity: new FormControl(null, Validators.required),
      unitType: new FormControl(null, Validators.required),
    });
  }
onProductChange(index: number): void {
  const orderDetailsArray = this.getOrderDetails();
  const selectedProductId = Number(orderDetailsArray.at(index).get('productId')?.value); // Convertir a número

  const selectedProduct = this.productos.find((p: any) => p.id === selectedProductId);

  if (selectedProduct) {
    orderDetailsArray.at(index).patchValue({ unitType: selectedProduct.unitType });
  } else {
    console.error(`No se encontró el unitType para el producto con ID ${selectedProductId}`);
  }
}

  
  
  addProduct() {
    (this.form.get('orderDetails') as FormArray).push(this.createProductForm());
  }
  
  removeProduct(index: number) {
    (this.form.get('orderDetails') as FormArray).removeAt(index);
  }
  getOrderDetails(): FormArray {
    return this.form.get('orderDetails') as FormArray;
  }
  // Agregar nueva categoría (simulación)
  /*
  addCategory() {
    const newCategory = prompt('Ingrese el nombre de la nueva categoría:');
    if (newCategory && !this.categories.includes(newCategory)) {
      this.categories.push(newCategory);
    }
  }
*/
  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }
  

  submit() {
    if (this.form.valid) {
      this.pedidosService.postPedidos(this.form.value).subscribe(
        (res) => {
          this.toastr.success('Pedido agregado correctamente', 'Éxito', { timeOut: 5000 });
          this.list();
          this.isModalOpen = false;
          this.toggleAddModal = false;
        },
        (err) => {
          this.toastr.error('Error al agregar el pedido', 'Error', { timeOut: 5000 });
        }
      );
    } else {
      this.toastr.error('Formulario inválido', 'Error', { timeOut: 5000 });
    }
  }

  get dataSource(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredData.slice(startIndex, endIndex);
  }
  
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.toastr.info('Página anterior', 'Paginación', { timeOut: 2000 });
    }
  }
  
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.toastr.info('Página siguiente', 'Paginación', { timeOut: 2000 });
    }
  }
  
  goToPage(page: number) {
    this.currentPage = page;
    this.toastr.info('Página ' + page, 'Paginación', { timeOut: 2000 });
  }

  
  
}

