import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient, HttpHeaders } from '@angular/common/http';

interface Product {
  id?: string;
  name: string;
  shortDescription: string;
  description?: string;
  price: number;
  imageUrl: string;
  stockQuantity: number;
  category: string;
  tags: string[];
  discountPercentage?: number;
  isAvailable?: boolean;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-products.component.html',
  styleUrls: ['./admin-products.component.css']
})
export class AdminProductsComponent implements OnInit {
  products: Product[] = [];
  filteredProducts: Product[] = [];
  searchTerm: string = '';

  productForm: Product = this.getEmptyForm();
  tagInput: string = ''; // new

  showForm: boolean = false;
  editingProduct: boolean = false;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadProducts();
  }

  getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  getEmptyForm(): Product {
    return {
      name: '',
      shortDescription: '',
      description: '',
      price: 0,
      imageUrl: '',
      stockQuantity: 0,
      category: '',
      tags: [],
      discountPercentage: 0,
      isAvailable: true
    };
  }

  loadProducts(): void {
    this.http.get<Product[]>('http://localhost:3000/products').subscribe({
      next: (res) => {
        this.products = res;
        this.filteredProducts = res;
      },
      error: () => alert('Failed to load products.')
    });
  }

  searchProducts(): void {
    const query = this.searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(query) ||
      (product.description?.toLowerCase().includes(query) ?? false)
    );
  }

  openAddForm(): void {
    this.showForm = true;
    this.editingProduct = false;
    this.productForm = this.getEmptyForm();
    this.tagInput = '';
  }

  editProduct(product: Product): void {
    this.productForm = { ...product };
    this.tagInput = product.tags.join(', ');
    this.editingProduct = true;
    this.showForm = true;
  }

  handleTagsInput(input: string): void {
    this.tagInput = input;
    this.productForm.tags = input.split(',').map(tag => tag.trim()).filter(Boolean);
  }

  saveProduct(): void {
    const headers = this.getAuthHeaders();

    const payload = {
      ...this.productForm,
      tags: this.productForm.tags || [],
      discountPercentage: this.productForm.discountPercentage || 0,
      isAvailable: this.productForm.isAvailable ?? true
    };

    if (this.editingProduct && this.productForm.id) {
      this.http.put(
        `http://localhost:3000/products/${this.productForm.id}`,
        payload,
        { headers }
      ).subscribe({
        next: () => {
          alert('Product updated.');
          this.loadProducts();
          this.cancelForm();
        },
        error: () => alert('Failed to update product.')
      });
    } else {
      this.http.post(
        `http://localhost:3000/products`,
        payload,
        { headers }
      ).subscribe({
        next: () => {
          alert('Product added.');
          this.loadProducts();
          this.cancelForm();
        },
        error: () => alert('Failed to add product.')
      });
    }
  }

  deleteProduct(id: string): void {
    const headers = this.getAuthHeaders();
    if (confirm('Are you sure you want to delete this product?')) {
      this.http.delete(
        `http://localhost:3000/products/${id}`,
        { headers }
      ).subscribe({
        next: () => {
          alert('Product deleted.');
          this.loadProducts();
        },
        error: () => alert('Failed to delete product.')
      });
    }
  }

  cancelForm(): void {
    this.showForm = false;
    this.productForm = this.getEmptyForm();
    this.tagInput = '';
  }
}
