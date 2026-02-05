// src/app/components/verify-otp/verify-otp.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NavbarComponent } from '../navbar/navbar.component';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-verify-otp',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, NavbarComponent],
  templateUrl: './verify-otp.component.html',
  styleUrl: './verify-otp.component.css'
})
export class VerifyOtpComponent implements OnInit {
  email = '';
  otp = '';
  loading = false;
  resending = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    // Get email from localStorage
    this.email = localStorage.getItem('pendingEmail') || '';
    if (!this.email) {
      this.router.navigate(['/register']);
    }
  }

  onSubmit() {
    this.errorMessage = '';
    this.successMessage = '';

    if (!this.otp || this.otp.length !== 6) {
      this.errorMessage = 'Please enter a valid 6-digit OTP';
      return;
    }

    this.loading = true;

    this.authService.verifyOTP({ email: this.email, otp: this.otp }).subscribe({
      next: (response) => {
        this.loading = false;
        if (response.success) {
          this.successMessage = 'Email verified successfully! Redirecting...';
          localStorage.removeItem('pendingEmail');
          setTimeout(() => {
            this.router.navigate(['/dashboard']);
          }, 1500);
        }
      },
      error: (error) => {
        this.loading = false;
        this.errorMessage = error.error?.message || 'OTP verification failed';
      }
    });
  }

  resendOTP() {
    this.errorMessage = '';
    this.successMessage = '';
    this.resending = true;

    this.authService.resendOTP(this.email).subscribe({
      next: (response) => {
        this.resending = false;
        if (response.success) {
          this.successMessage = 'New OTP sent to your email!';
        }
      },
      error: (error) => {
        this.resending = false;
        this.errorMessage = error.error?.message || 'Failed to resend OTP';
      }
    });
  }
}