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
  editingProduct: any = null;

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
    this.initForm();
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

  categories: any; 
  filteredData: any[] = []; 
  filteredDataOriginal: any[] = []; 
  currentPage: number = 1;
  pageSize: number = 10;
  totalPages: number = 0; 
  isFilterOpen: boolean = false;

  selectedField: string = ''; 
  filterValue: string = ''; 
  selectedCategory: string = ''; 
  priceGreaterThan: number | null = null;
  priceLessThan: number | null = null;

  editProduct(product: Productos) {
    this.editingProduct = product;
    this.form.patchValue({
      productName: product.productName,
      productDescription: product.productDescription,
      productPrice: product.productPrice,
      categoryId: product.category?.id,
      unitType: product.unitType,
      expirable: product.expirable.toString()
    });
    this.toggleAddModal = true;
  }

  deleteProduct(id: number) {
    if (confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      this.productosService.deleteProducto(id).subscribe(
        () => {
          this.toastr.success('Producto eliminado correctamente', 'Éxito');
          this.list(); 
        },
        (err) => {
          this.toastr.error('Error al eliminar el producto.', 'Error');
        }
      );
    }
  }

  openCategorySettings() {
    this.isCategorySettingsOpen = true;
    this.categoriesList();
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
          this.categoriesList();
          this.list();
        },
        (err) => {
          this.toastr.error('Error al eliminar la categoría. Asegúrate de que no esté en uso.', 'Error');
        }
      );
    }
  }


  list() {
    this.productosService.list().subscribe(
      (data: any[]) => {
        this.filteredData = data.map(producto => ({
          ...producto,
          stock: Array.isArray(producto.stocks) 
            ? producto.stocks.reduce((acc: number, stock: { quantity: number }) => acc + (stock.quantity || 0), 0) 
            : 0
        }));
        this.filteredDataOriginal = [...this.filteredData];
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
        this.categories = res;
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
    this.filterValue = '';
    this.selectedCategory = '';
    this.priceGreaterThan = null;
    this.priceLessThan = null;
  }
  toggleFilter() {
    this.isFilterOpen = !this.isFilterOpen;
  }

  toggleGuide() {
    this.showGuide = !this.showGuide;
  }

  applyFilters() {
    this.currentPage = 1;
    let filtered = this.filteredDataOriginal || this.filteredData;

    if (this.selectedField === 'nombre' && this.filterValue) {
      filtered = filtered.filter((item) =>
        item.productName?.toLowerCase().includes(this.filterValue.toLowerCase())
      );
    } else if (this.selectedField === 'descripcion' && this.filterValue) {
      filtered = filtered.filter((item) =>
        item.productDescription?.toLowerCase().includes(this.filterValue.toLowerCase())
      );
    } else if (this.selectedField === 'precio') {
      if (this.priceGreaterThan !== null && this.priceGreaterThan !== undefined) {
        filtered = filtered.filter(item => item.productPrice > this.priceGreaterThan!);
      }
      if (this.priceLessThan !== null && this.priceLessThan !== undefined) {
        filtered = filtered.filter(item => item.productPrice < this.priceLessThan!);
      }
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
      this.filteredData = [...this.filteredData];
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
    this.editingProduct = null;
    this.form.reset();
    this.toggleAddModal = true;
  }

  submit() {
    if (this.form.valid) {
      if (this.editingProduct) {
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
        this.productosService.updateCategoria(this.editingCategory.id, categoryData).subscribe(
          () => {
            this.toastr.success('Categoría actualizada correctamente', 'Éxito');
            this.categoriesList();
            this.list();
            this.cancelEditCategory();
          },
          (err) => {
            this.toastr.error('Error al actualizar la categoría', 'Error');
          }
        );
      } else {
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
