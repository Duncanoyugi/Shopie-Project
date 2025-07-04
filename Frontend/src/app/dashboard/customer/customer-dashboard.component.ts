import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Product {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  price: number;
}

interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address?: string;
  profileImage?: string;
}

@Component({
  selector: 'app-customer-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './customer-dashboard.component.html',
  styleUrls: ['./customer-dashboard.component.css']
})
export class CustomerDashboardComponent implements OnInit {
  userProfile: UserProfile = {
    id: '',
    fullName: '',
    email: '',
    phoneNumber: '',
    address: '',
    profileImage: ''
  };

  allProducts: Product[] = [];
  filteredProducts: Product[] = [];
  searchQuery = '';
  cart: Product[] = [];

  showProfile = false;
  selectedFile: File | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchProfile();
    this.fetchProducts();
  }

  toggleProfile(): void {
    this.showProfile = !this.showProfile;
  }

  fetchProfile(): void {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user?.id) {
      this.http.get<UserProfile>(`http://localhost:3000/users/${user.id}`).subscribe({
        next: (data) => this.userProfile = data,
        error: () => alert('Failed to load profile')
      });
    }
  }

  updateProfile(): void {
    this.http.put(`http://localhost:3000/users/${this.userProfile.id}`, this.userProfile).subscribe({
      next: () => alert('Profile updated successfully!'),
      error: () => alert('Failed to update profile')
    });
  }

  onFileSelected(event: any): void {
    this.selectedFile = event.target.files[0];
  }

  uploadProfileImage(): void {
    if (!this.selectedFile) return alert('No file selected.');

    const formData = new FormData();
    formData.append('file', this.selectedFile);

    this.http.post(`http://localhost:3000/users/${this.userProfile.id}/upload`, formData).subscribe({
      next: (res: any) => {
        this.userProfile.profileImage = res.url || '';
        alert('Profile photo updated!');
      },
      error: () => alert('Failed to upload photo')
    });
  }

  fetchProducts(): void {
    this.http.get<Product[]>('http://localhost:3000/products').subscribe({
      next: (products) => {
        this.allProducts = products;
        this.filteredProducts = products;
      },
      error: () => alert('Failed to load products')
    });
  }

  searchProducts(): void {
    const query = this.searchQuery.trim().toLowerCase();
    this.filteredProducts = this.allProducts.filter(product =>
      product.name.toLowerCase().includes(query) ||
      product.description.toLowerCase().includes(query)
    );
  }

  addToCart(product: Product): void {
    if (!this.cart.some(p => p.id === product.id)) {
      this.cart.push(product);
    }
  }

  removeFromCart(productId: string): void {
    this.cart = this.cart.filter(p => p.id !== productId);
  }
}
