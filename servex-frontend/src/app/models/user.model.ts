// src/app/models/user.model.ts
export interface User {
  email: string;
  name: string;
  role: 'client' | 'admin'; // Only two roles
  isVerified?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    token?: string;
    user?: User;
    email?: string;
    name?: string;
  };
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface OTPRequest {
  email: string;
  otp: string;
}