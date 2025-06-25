import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { ProductosService } from '../productos.service';

@Component({
  selector: 'app-stock',
  imports: [
    FormsModule,
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    
  ],
  templateUrl: './stock.component.html',
  styleUrl: './stock.component.scss',
})
export class StockComponent implements OnInit {
  constructor(
    private router: Router,
    private productosService: ProductosService,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute
  ) {}
  form: FormGroup = new FormGroup({});

  ngOnInit(): void {
    this.initParams();
  }

  initParams(): void {
    this.activatedRoute.params.subscribe((params) => {
      this.productId = params['productId'];
    });
    this.list();
  }

  initForm() {
    this.form = new FormGroup({
      quantity: new FormControl('', Validators.required),
      expirationDate: new FormControl('', Validators.required),
    });
  }
  addStock() {
    this.isAddModalOpen = true;
    this.toggleAddModal = true;
    this.initForm();
  }

  productId: number = 0;
  isAddModalOpen: boolean = false;
  toggleAddModal: boolean = false;
  displayedColumns: string[] = ['position', 'cantidad', 'fecha'];
  routerProductos = '/productos';
  @Output() modalStateChange = new EventEmitter<boolean>();

  filteredData: any[] = [];
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0; // Inicializado como 0 y recalculado después
  isFilterOpen: boolean = false;

  // Campos dinámicos
  selectedField: string = ''; // Campo seleccionado (nombre, cantidad, etc.)
  filterValue: string = ''; // Valor del filtro para campos como nombre o precio
  selectedCategory: string = ''; // Categoría seleccionada

  submit() {
    if (this.form.valid) {
      this.productosService.postStock(this.productId, this.form.value).subscribe(
        (res) => {
          this.toastr.success('Stock agregado correctamente', 'Éxito', { timeOut: 5000 });
          this.list();
          this.isAddModalOpen = false;
          this.toggleAddModal = false;
        },
        (err) => {
          this.toastr.error('Error al agregar el stock', 'Error', { timeOut: 5000 });
        }
      );
    } else {
      this.toastr.error('Formulario inválido', 'Error', { timeOut: 5000 });
    }
  }

  list() {
    this.productosService.stock(this.productId).subscribe(
      (data: any[]) => {
        this.filteredData = data || [];
        this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
      },
      (error) => {
        this.toastr.error('Error al obtener el stock', 'Error', { timeOut: 5000 });
      }
    );
  }

  atras() {
    this.router.navigate([this.routerProductos]);
    this.toastr.info('Volviendo a productos', 'Info', { timeOut: 3000 });
  }
  onFieldSelect() {
    // Reinicia el valor del filtro al seleccionar un nuevo campo
    this.filterValue = '';
    this.selectedCategory = '';
  }
  toggleFilter() {
    this.isFilterOpen = !this.isFilterOpen;
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  get dataSource(): any[] {
    return Array.isArray(this.filteredData)
      ? this.filteredData.slice(0, this.pageSize)
      : [];
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

export interface Stocks {
  cantidad: string;
  fechaExpiracion: Date;
}
