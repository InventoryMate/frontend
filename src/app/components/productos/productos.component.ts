import { CommonModule } from '@angular/common';
import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { Router, RouterLink } from '@angular/router';
import { ProductosService } from './productos.service';
import { HttpClientModule } from '@angular/common/http';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-productos',
  imports: [
    FormsModule,
    CommonModule,
    MatTableModule,
    MatIconModule,
    MatButtonModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    HttpClientModule,
  ],
  templateUrl: './productos.component.html',
  styleUrl: './productos.component.scss',
})
export class ProductosComponent implements OnInit {

  constructor(
    private router: Router,
    private productosService: ProductosService,
    private toastr: ToastrService
  ) {}
  form: FormGroup = new FormGroup({});
  formCategoria: FormGroup = new FormGroup({});
  ngOnInit(): void {
    this.list();
    this.categoriesList();
  }
  isModalOpen = false;
  isModalOpenCategoria = false;

  toggleAddModal: boolean = false;
  toggleAddModalCategoria: boolean = false;
  productId: number = 0;
  displayedColumns: string[] = [
    'position',
    'nombre',
    'descripcion',
    'precio',
    'unidad',
    'categoria',
    'stock',
  ];
  routerDetalle =`/productos/${this.productId}/stocks`;
  routerNuevo = '/productos/nuevo';

  @Output() modalStateChange = new EventEmitter<boolean>();

  categories: any; // Inicializado como un arreglo vacío
  filteredData: any[] = []; // Inicializado como un arreglo vacío
  filteredDataOriginal: any[] = []; // Nueva propiedad para guardar los datos originales
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0; // Inicializado como 0 y recalculado después
  isFilterOpen: boolean = false;

  // Campos dinámicos
  selectedField: string = ''; // Campo seleccionado (nombre, cantidad, etc.)
  filterValue: string = ''; // Valor del filtro para campos como nombre o precio
  selectedCategory: string = ''; // Categoría seleccionada

  list() {
    this.productosService.list().subscribe(
      (data: any[]) => {
        this.filteredData = data.map(producto => ({
          ...producto,
          stock: Array.isArray(producto.stocks) 
            ? producto.stocks.reduce((acc: number, stock: { quantity: number }) => acc + (stock.quantity || 0), 0) 
            : 0
        }));
        this.filteredDataOriginal = [...this.filteredData]; // Guardar copia original para filtros
        this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
      },
      (error) => {
        console.error('Error al obtener los datos', error);
      }
    );
  }
  
  
  
  

  categoriesList() {
    this.productosService.categorias().subscribe(
      (res) => {
        this.categories = res; // Asignar las categorías desde la API
      },
      (err) => {
        console.error('Error al obtener las categorías', err);
      }
    );
  }

  viewDetails(i:number) {
    this.router.navigate([`/productos/${i}/stocks`]);
    console.log(`/productos/${i}/stocks`)
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
    this.currentPage = 1; // Reiniciar a la primera página
    let filtered = this.filteredDataOriginal || this.filteredData;

    if (this.selectedField === 'nombre' && this.filterValue) {
      filtered = filtered.filter((item) =>
        item.productName?.toLowerCase().includes(this.filterValue.toLowerCase())
      );
    } else if (this.selectedField === 'descripcion' && this.filterValue) {
      filtered = filtered.filter((item) =>
        item.productDescription?.toLowerCase().includes(this.filterValue.toLowerCase())
      );
    } else if (this.selectedField === 'precio' && this.filterValue) {
      filtered = filtered.filter((item) =>
        item.productPrice?.toString().includes(this.filterValue)
      );
    } else if (this.selectedField === 'unidad' && this.filterValue) {
      filtered = filtered.filter((item) =>
        item.unitType?.toLowerCase().includes(this.filterValue.toLowerCase())
      );
    } else if (this.selectedField === 'categoria' && this.selectedCategory) {
      filtered = filtered.filter((item) =>
        item.category?.categoryName === this.selectedCategory
      );
    }

    this.filteredData = filtered;
    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
    this.toggleFilter();
  }

  // Lógica de agregar categoría (como antes)
  addCategory() {
    const newCategory = prompt('Ingrese el nombre de la nueva categoría:');
    if (newCategory && !this.categories.includes(newCategory)) {
      this.categories.push(newCategory);
    }
  }

  filterByCategory() {
    this.currentPage = 1;

    if (this.selectedCategory === '') {
      this.filteredData = [...this.filteredData]; // Mostrar todos los elementos
    }

    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
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

  get dataSource(): any[] {
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    return this.filteredData.slice(startIndex, endIndex);
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
    }
  }

  goToPage(page: number) {
    this.currentPage = page;
  }
  initForm() {
    this.form = new FormGroup({
      productName: new FormControl('',Validators.required),
      productDescription: new FormControl('',Validators.required),
      productPrice: new FormControl('',Validators.required),
      categoryId: new FormControl('',Validators.required),
      unitType: new FormControl('',Validators.required),
      expirable: new FormControl('',Validators.required),
    });
  }

  initFormCategoria() {
    this.formCategoria = new FormGroup({
      categoryName: new FormControl('',Validators.required),
    });
  }

  addPedido() {
    this.isModalOpen = true;
    this.toggleAddModal = true;
    this.initForm();
  }

  addCategoria(){
    this.isModalOpenCategoria = true;
    this.toggleAddModalCategoria = true;
    this.initFormCategoria();
  }

  submit() {
    if (this.form.valid) {
      this.productosService.postProducto(this.form.value).subscribe(
        (res) => {
          this.toastr.success('Producto agregado correctamente', 'Éxito');
          this.list();
          this.isModalOpen = false;
          this.toggleAddModal = false;
        },
        (err) => {
          this.toastr.error('Error al agregar el producto', 'Error');
        }
      );
    } else {
      this.toastr.error('Formulario inválido', 'Error');
    }
  }

  submitCategoria() {
    if (this.formCategoria.valid) {
      this.productosService.postCategoria(this.formCategoria.value).subscribe(
        (res) => {
          this.isModalOpenCategoria = false;
          this.toggleAddModalCategoria = false;
          setTimeout(() => {
            this.toastr.success('Categoría agregada correctamente', 'Éxito', { timeOut: 5000 });
          }, 300);
          this.categoriesList();
        },
        (err) => {
          this.toastr.error('Error al agregar la categoría', 'Error', { timeOut: 5000 });
        }
      );
    } else {
      this.toastr.error('Formulario inválido', 'Error', { timeOut: 5000 });
    }
  }


}

export interface Productos {
  id:number;
  productName: string;
  productDescription: string;
  productPrice: number;
  unitType: string;
  category?: { id: number; categoryName: string } | null;
  expirable: boolean;
}
