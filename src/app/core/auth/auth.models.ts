export type UserRole = 'FASHIONISTA' | 'STYLISTE' | 'ADMIN';
export type RegisterRole = Exclude<UserRole, 'ADMIN'>;

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  message?: string;
  userId: number;
  email: string;
  role: UserRole | string;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: RegisterRole;
}

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  emailVerified?: boolean;
  accountVerified?: boolean;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
