import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';

import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (
  request: HttpRequest<unknown>,
  next: HttpHandlerFn
) => {
  const authService = inject(AuthService);

  // ── 1. Attach token to outgoing request ──────────────────────────────────
  const authedRequest = addToken(request, authService.getAccessToken());

  // ── 2. Handle response errors ────────────────────────────────────────────
  return next(authedRequest).pipe(
    catchError((error: unknown) => {
      // Only attempt a token refresh on 401 or 403
      if (
        error instanceof HttpErrorResponse &&
        (error.status === 401 || error.status === 403) &&
        !request.url.includes('/auth/')   // never retry auth endpoints themselves
      ) {
        return authService.refreshToken().pipe(
          switchMap(() => {
            // Retry the original request with the new access token
            const retried = addToken(request, authService.getAccessToken());
            return next(retried);
          }),
          catchError((refreshError: unknown) => {
            // Refresh itself failed — token is invalid, force logout
            authService.logout();
            return throwError(() => refreshError);
          })
        );
      }

      return throwError(() => error);
    })
  );
};

function addToken(
  request: HttpRequest<unknown>,
  token: string | null
): HttpRequest<unknown> {
  if (!token) return request;
  return request.clone({
    setHeaders: { Authorization: `Bearer ${token}` },
  });
}