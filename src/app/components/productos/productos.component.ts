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

  showGuide: boolean = false;
  isCategorySettingsOpen: boolean = false;
  editingCategory: any = null;
  editingProduct: any = null; // Para saber si estamos editando un producto

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
    this.initFormCategoria();
    this.initForm(); // Inicializar el formulario de producto
  }
  isModalOpen = false;

  toggleAddModal: boolean = false;
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

  // --- Product Management Methods ---

  editProduct(product: Productos) {
    this.editingProduct = product;
    this.form.patchValue({
      productName: product.productName,
      productDescription: product.productDescription,
      productPrice: product.productPrice,
      categoryId: product.category?.id,
      unitType: product.unitType,
      expirable: product.expirable.toString() // Asegurarse que el valor es string para el select
    });
    this.toggleAddModal = true;
  }

  deleteProduct(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      this.productosService.deleteProducto(id).subscribe(
        () => {
          this.toastr.success('Producto eliminado correctamente', 'Éxito');
          this.list(); // Recargar la lista de productos
        },
        (err) => {
          this.toastr.error('Error al eliminar el producto.', 'Error');
        }
      );
    }
  }

  // --- End of Product Management Methods ---

  // --- Category Management Methods ---

  openCategorySettings() {
    this.isCategorySettingsOpen = true;
    this.categoriesList(); // Refresh categories when opening
    this.cancelEditCategory();
  }

  closeCategorySettings() {
    this.isCategorySettingsOpen = false;
    this.cancelEditCategory();
  }

  editCategory(category: any) {
    this.editingCategory = category;
    this.formCategoria.patchValue({
      categoryName: category.categoryName
    });
  }

  cancelEditCategory() {
    this.editingCategory = null;
    this.formCategoria.reset();
  }

  deleteCategory(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar esta categoría?')) {
      this.productosService.deleteCategoria(id).subscribe(
        () => {
          this.toastr.success('Categoría eliminada correctamente', 'Éxito');
          this.categoriesList(); // Refresh the list
          this.list(); // Refresh products list in case some product's category is now null
        },
        (err) => {
          this.toastr.error('Error al eliminar la categoría. Asegúrate de que no esté en uso.', 'Error');
        }
      );
    }
  }

  // --- End of Category Management Methods ---

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

  toggleGuide() {
    this.showGuide = !this.showGuide;
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

  filterByCategory() {
    this.currentPage = 1;

    if (this.selectedCategory === '') {
      this.filteredData = [...this.filteredData]; // Mostrar todos los elementos
    }

    this.totalPages = Math.ceil(this.filteredData.length / this.pageSize);
  }

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
      productName: new FormControl('', Validators.required),
      productDescription: new FormControl('', Validators.required),
      productPrice: new FormControl('', Validators.required),
      categoryId: new FormControl('', Validators.required),
      unitType: new FormControl('', Validators.required),
      expirable: new FormControl('', Validators.required),
    });
  }

  initFormCategoria() {
    this.formCategoria = new FormGroup({
      categoryName: new FormControl('',Validators.required),
    });
  }

  addPedido() {
    this.editingProduct = null; // Salir del modo edición
    this.form.reset(); // Limpiar el formulario
    this.toggleAddModal = true;
  }

  submit() {
    if (this.form.valid) {
      if (this.editingProduct) {
        // --- Lógica para ACTUALIZAR ---
        this.productosService.updateProducto(this.editingProduct.id, this.form.value).subscribe(
          () => {
            this.toastr.success('Producto actualizado correctamente', 'Éxito');
            this.list();
            this.toggleAddModal = false;
            this.editingProduct = null;
          },
          (err) => {
            this.toastr.error('Error al actualizar el producto', 'Error');
          }
        );
      } else {
        // --- Lógica para CREAR ---
        this.productosService.postProducto(this.form.value).subscribe(
          () => {
            this.toastr.success('Producto agregado correctamente', 'Éxito');
            this.list();
            this.toggleAddModal = false;
          },
          (err) => {
            this.toastr.error('Error al agregar el producto', 'Error');
          }
        );
      }
    } else {
      this.toastr.error('Formulario inválido', 'Error');
    }
  }

  submitCategoria() {
    if (this.formCategoria.valid) {
      const categoryData = this.formCategoria.value;

      if (this.editingCategory) {
        // Update existing category
        this.productosService.updateCategoria(this.editingCategory.id, categoryData).subscribe(
          () => {
            this.toastr.success('Categoría actualizada correctamente', 'Éxito');
            this.categoriesList();
            this.list(); // Refresh products as well
            this.cancelEditCategory();
          },
          (err) => {
            this.toastr.error('Error al actualizar la categoría', 'Error');
          }
        );
      } else {
        // Create new category
        this.productosService.postCategoria(categoryData).subscribe(
          () => {
            this.toastr.success('Categoría agregada correctamente', 'Éxito');
            this.categoriesList();
            this.formCategoria.reset();
          },
          (err) => {
            this.toastr.error('Error al agregar la categoría', 'Error');
          }
        );
      }
    } else {
      this.toastr.error('El nombre de la categoría no puede estar vacío', 'Error');
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
