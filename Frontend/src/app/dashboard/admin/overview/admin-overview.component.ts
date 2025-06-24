import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-admin-overview',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './admin-overview.component.html',
  styleUrls: ['./admin-overview.component.css']
})
export class AdminOverviewComponent implements OnInit {
  totalProducts = 0;
  totalUsers = 0;
  ordersToday = 0;

  private headers: HttpHeaders;

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('token');
    this.headers = new HttpHeaders({
      Authorization: `Bearer ${token}`
    });
  }

  ngOnInit(): void {
    this.fetchProductCount();
    this.fetchUserCount();
    this.fetchOrdersToday();
  }

  fetchProductCount() {
    this.http.get<any[]>('http://localhost:3000/products', { headers: this.headers }).subscribe({
      next: (products) => this.totalProducts = products.length,
      error: () => console.warn('Failed to fetch products')
    });
  }

  fetchUserCount() {
    this.http.get<any[]>('http://localhost:3000/users', { headers: this.headers }).subscribe({
      next: (users) => this.totalUsers = users.length,
      error: () => console.warn('Failed to fetch users')
    });
  }

  fetchOrdersToday() {
    this.http.get<any[]>('http://localhost:3000/orders/today', { headers: this.headers }).subscribe({
      next: (orders) => this.ordersToday = orders.length,
      error: () => console.warn('Failed to fetch today\'s orders')
    });
  }
}
