// src/app/components/register/register.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { RegisterRequest } from '../../models/user.model';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  formData: RegisterRequest = {
    name: '',
    email: '',
    password: ''
  };
  
  confirmPassword = '';
  loading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    // Validation
    if (!this.formData.name || !this.formData.email || !this.formData.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    if (this.formData.password.length < 6) {
      this.errorMessage = 'Password must be at least 6 characters';
      return;
    }

    if (this.formData.password !== this.confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.loading = true;

    this.authService.register(this.formData).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.successMessage = response.message;
          // Store email for OTP verification
          localStorage.setItem('pendingEmail', this.formData.email);
          // Redirect to OTP verification after 1 second
          setTimeout(() => {
            this.router.navigate(['/verify-otp']);
          }, 1000);
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Registration failed. Please try again.';
      }
    });
  }

  signInWithGoogle() {
  this.loading = true;
  this.authService.signInWithGoogle().subscribe({
    next: (response) => {
      this.loading = false;
      if (response.success) {
        this.router.navigate(['/dashboard']);
      }
    },
    error: (error) => {
      this.loading = false;
      this.errorMessage = error.error?.message || 'Google sign-in failed';
    }
  });
} 
}