import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']


})
export class LoginComponent {
  loginForm: FormGroup;
  submitted = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });
  }

  onSubmit(): void {
    this.submitted = true;

    if (this.loginForm.invalid) return;

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (res) => {
        this.authService.storeToken(res.accessToken);
        this.authService.storeUser(res.user);

        // Role-based redirection
        if (res.user.role === 'ADMIN') {
          this.router.navigate(['/dashboard/admin']);
        } else if (res.user.role === 'CUSTOMER') {
          this.router.navigate(['/dashboard/customer']);
        } else {
          this.router.navigate(['/login']); // fallback
        }
      },
      error: (err) => {
        this.errorMessage = err.error?.message || 'Login failed. Try again.';
      },
    });
  }

}
