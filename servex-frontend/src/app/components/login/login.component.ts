// src/app/components/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../services/auth.service';
import { LoginRequest } from '../../models/user.model';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  formData: LoginRequest = {
    email: '',
    password: ''
  };
  
  loading = false;
  errorMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onSubmit() {
    this.errorMessage = '';

    if (!this.formData.email || !this.formData.password) {
      this.errorMessage = 'Please fill in all fields';
      return;
    }

    this.loading = true;

    this.authService.login(this.formData).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          // Redirect to dashboard
          this.router.navigate(['/dashboard']);
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
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