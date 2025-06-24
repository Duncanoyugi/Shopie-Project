import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class RegisterComponent {
  form = {
    fullName: '',
    email: '',
    password: '',
    phoneNumber: '',
    address: ''
  };

  selectedImage: File | null = null; // 👈 ADD THIS

  isSubmitting = false;
  errorMessage = '';

  constructor(private authService: AuthService, private router: Router) {}

  // 👇 HANDLER FOR FILE INPUT
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedImage = input.files[0];
    }
  }

  register(): void {
    this.isSubmitting = true;
    this.errorMessage = '';

    // You can prepare FormData if backend expects file uploads
    const formData = new FormData();
    formData.append('fullName', this.form.fullName);
    formData.append('email', this.form.email);
    formData.append('password', this.form.password);
    formData.append('phoneNumber', this.form.phoneNumber);
    formData.append('address', this.form.address);

    if (this.selectedImage) {
      formData.append('profileImage', this.selectedImage);
    }

    // Send formData instead of raw JSON
    this.authService.register(formData).subscribe({
      next: () => {
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = err.error?.message || 'Registration failed';
      }
    });
  }
}
