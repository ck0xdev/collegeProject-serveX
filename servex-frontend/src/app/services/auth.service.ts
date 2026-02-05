// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../environment';
import {
  AuthResponse,
  RegisterRequest,
  LoginRequest,
  OTPRequest,
  User,
} from '../models/user.model';
import { Auth, signInWithPopup, GoogleAuthProvider } from '@angular/fire/auth';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = environment.apiUrl;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(
    private http: HttpClient,
    private auth: Auth, // Add this
  ) {
    const token = this.getToken();
    const user = this.getUserFromStorage();
    if (token && user) {
      this.currentUserSubject.next(user);
    }
  }

  register(data: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, data);
  }

  verifyOTP(data: OTPRequest): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/verify-otp`, data)
      .pipe(
        tap((response) => {
          if (response.success && response.data?.token) {
            this.saveToken(response.data.token);
            if (response.data.user) {
              this.saveUser(response.data.user);
              this.currentUserSubject.next(response.data.user);
            }
          }
        }),
      );
  }

  login(data: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, data).pipe(
      tap((response) => {
        if (response.success && response.data?.token) {
          this.saveToken(response.data.token);
          if (response.data.user) {
            this.saveUser(response.data.user);
            this.currentUserSubject.next(response.data.user);
          }
        }
      }),
    );
  }

  resendOTP(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/resend-otp`, {
      email,
    });
  }

  // Google Sign-In
  signInWithGoogle(): Observable<AuthResponse> {
    const provider = new GoogleAuthProvider();

    return new Observable((observer) => {
      signInWithPopup(this.auth, provider)
        .then((result) => {
          const user = result.user;

          // Send user data to backend to create/login user
          this.http
            .post<AuthResponse>(`${this.apiUrl}/auth/google-login`, {
              uid: user.uid,
              email: user.email,
              name: user.displayName,
              photoURL: user.photoURL,
            })
            .subscribe({
              next: (response) => {
                if (response.success && response.data?.token) {
                  this.saveToken(response.data.token);
                  if (response.data.user) {
                    this.saveUser(response.data.user);
                    this.currentUserSubject.next(response.data.user);
                  }
                }
                observer.next(response);
                observer.complete();
              },
              error: (error) => {
                observer.error(error);
              },
            });
        })
        .catch((error) => {
          observer.error(error);
        });
    });
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  isLoggedIn(): boolean {
    return !!this.getToken();
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  private saveToken(token: string): void {
    localStorage.setItem('token', token);
  }

  private saveUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  }

  private getUserFromStorage(): User | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
}
