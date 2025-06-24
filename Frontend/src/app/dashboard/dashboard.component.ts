import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-dashboard',
  imports: [CommonModule, RouterModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent {
  user = JSON.parse(localStorage.getItem('user') || '{}');

  get isAdmin(): boolean {
    return this.user?.role === 'ADMIN';
  }

  get isCustomer(): boolean {
    return this.user?.role === 'CUSTOMER';
  }
}
