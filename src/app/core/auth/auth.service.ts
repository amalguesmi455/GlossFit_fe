import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, map, tap, throwError } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthResponse, AuthUser, RegisterRequest, SignInRequest, UserRole } from './auth.models';

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
      throw new Error(response.message || 'Compte non connecte. Veuillez verifier votre email puis vous connecter.');
    }

    const user = this.toUser(response);

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
      user.role = this.normalizeRole(user.role);
      return user;
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
    };
  }

  private normalizeRole(role: string): UserRole {
    const normalized = role.toUpperCase();

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
