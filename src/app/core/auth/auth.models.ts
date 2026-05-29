export type UserRole = 'FASHIONISTA' | 'STYLISTE' | 'ADMIN';
export type RegisterRole = Exclude<UserRole, 'ADMIN'>;

export interface AuthResponse {
  accessToken?: string;
  refreshToken?: string;
  message?: string;
  userId: number;
  email: string;
  role: UserRole | string;
  hasProfile?: boolean;
  has_profile?: boolean;
  active?: boolean;
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

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ApiMessage {
  message?: string;
  error?: string;
}

export interface AuthUser {
  id: number;
  email: string;
  role: UserRole;
  hasProfile?: boolean;
  has_profile?: boolean;
  emailVerified?: boolean;
  accountVerified?: boolean;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}
