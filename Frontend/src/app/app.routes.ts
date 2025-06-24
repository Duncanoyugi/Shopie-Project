import { Routes } from '@angular/router';
import { RegisterComponent } from './auth/register/register.component';
import { LoginComponent } from './auth/login/login.component';
import { CustomerDashboardComponent } from './dashboard/customer/customer-dashboard.component';
import { AdminDashboardComponent } from './dashboard/admin/admin-dashboard.component';
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';
import { CustomerGuard } from './guards/customer.guard';

export const routes: Routes = [
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'dashboard/admin',
    component: AdminDashboardComponent,
    canActivate: [AuthGuard, AdminGuard],
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./dashboard/admin/overview/admin-overview.component').then(m => m.AdminOverviewComponent),
        canActivate: [AuthGuard, AdminGuard]
      },

      {
        path: 'products',
        loadComponent: () =>
          import('./dashboard/admin/products/admin-products.component').then(
            (m) => m.AdminProductsComponent
          )
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./dashboard/admin/users/admin-users.component').then(
            (m) => m.AdminUsersComponent
          )
      },
      {
        path: 'orders',
        loadComponent: () =>
          import('./dashboard/admin/orders/admin-orders.component').then(
            (m) => m.AdminOrdersComponent
          )
      }
    ]
  },
  {
    path: 'dashboard/customer',
    component: CustomerDashboardComponent,
    canActivate: [AuthGuard, CustomerGuard]
  },
  { path: '', redirectTo: 'login', pathMatch: 'full' }
];
