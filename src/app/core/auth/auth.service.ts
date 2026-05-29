import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import {
  ApiMessage,
  AuthResponse,
  AuthUser,
  ChangePasswordRequest,
  ForgotPasswordRequest,
  RegisterRequest,
  ResetPasswordRequest,
  SignInRequest,
  UserRole,
} from './auth.models';

const ACCESS_TOKEN_KEY = 'glossfit_access_token';
const REFRESH_TOKEN_KEY = 'glossfit_refresh_token';
const USER_KEY = 'glossfit_user';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly authUrl = `${environment.apiUrl}/auth`;
  private readonly currentUserSubject = new BehaviorSubject<AuthUser | null>(this.readStoredUser());

  currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {}

  get currentUser(): AuthUser | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  signIn(payload: SignInRequest): Observable<AuthUser> {
    return this.http.post<AuthResponse>(`${this.authUrl}/sign-in`, payload).pipe(
      tap(response => this.storeSession(response)),
      map(response => this.toUser(response)),
      catchError(error => this.handleAuthError(error))
    );
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/register`, payload).pipe(
      catchError(error => this.handleAuthError(error))
    );
  }

  verifyEmail(token: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/verify-email`, { token }).pipe(
      catchError(error => this.handleAuthError(error))
    );
  }

  requestPasswordReset(payload: ForgotPasswordRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/forgot-password`, payload).pipe(
      catchError(error => this.handleAuthError(error))
    );
  }

  resetPassword(payload: ResetPasswordRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/reset-password`, payload).pipe(
      catchError(error => this.handleAuthError(error))
    );
  }

  changePassword(payload: ChangePasswordRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.authUrl}/change-password`, payload).pipe(
      catchError(error => this.handleAuthError(error))
    );
  }

  deleteCurrentAccount(): Observable<ApiMessage> {
    return this.http.delete<ApiMessage>(`${this.authUrl}/delete-account`).pipe(
      catchError(error => this.handleAuthError(error))
    );
  }

  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();

    return this.http.post<AuthResponse>(`${this.authUrl}/refresh-token`, { refreshToken }).pipe(
      tap(response => this.storeSession(response)),
      catchError(error => this.handleAuthError(error))
    );
  }

  logout(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.currentUserSubject.next(null);
  }

  /**
   * Call this after a profile is successfully created or deleted
   * to keep the local session in sync with the database.
   */
  updateHasProfile(value: boolean): void {
    const user = this.currentUser;
    if (!user) return;

    const updated: AuthUser = { ...user, hasProfile: value };
    localStorage.setItem(USER_KEY, JSON.stringify(updated));
    this.currentUserSubject.next(updated);
  }

  getAccessToken(): string | null {
    const token = localStorage.getItem(ACCESS_TOKEN_KEY);
    return token && token !== 'undefined' ? token : null;
  }

  private getRefreshToken(): string | null {
    const token = localStorage.getItem(REFRESH_TOKEN_KEY);
    return token && token !== 'undefined' ? token : null;
  }

  private storeSession(response: AuthResponse): void {
    if (!response.accessToken || !response.refreshToken) {
      this.logout();
      throw new Error(response.message || 'Compte non connecté. Veuillez vérifier votre email puis vous connecter.');
    }

    const user = this.toUser(response);

    if (response.active === false || user.active === false) {
      this.logout();
      throw new Error(response.message || 'Votre compte est inactif. Veuillez contacter l’administration de la plateforme.');
    }

    localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.currentUserSubject.next(user);
  }

  private readStoredUser(): AuthUser | null {
    const rawUser = localStorage.getItem(USER_KEY);

    if (!rawUser) {
      return null;
    }

    try {
      const user = JSON.parse(rawUser) as AuthUser;
      return {
        ...user,
        role: this.normalizeRole(user.role),
        hasProfile: this.readHasProfile(user),
      };
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }

  private toUser(response: AuthResponse): AuthUser {
    return {
      id: response.userId,
      email: response.email,
      role: this.normalizeRole(response.role),
      hasProfile: this.readHasProfile(response),
      active: response.active,
    };
  }

  private readHasProfile(source: Pick<AuthResponse, 'hasProfile' | 'has_profile'> | Pick<AuthUser, 'hasProfile' | 'has_profile'>): boolean {
    return source.hasProfile ?? source.has_profile ?? false;
  }

  private normalizeRole(role: string): UserRole {
    const normalized = String(role || '').replace(/^ROLE_/, '').toUpperCase();

    if (normalized === 'STYLISTE' || normalized === 'ADMIN') {
      return normalized;
    }

    return 'FASHIONISTA';
  }

  private handleAuthError(error: HttpErrorResponse): Observable<never> {
    const fallback = 'Impossible de traiter la demande pour le moment.';
    const message =
      typeof error.error === 'string'
        ? error.error
        : error.error?.message || fallback;

    return throwError(() => new Error(message));
  }
}
