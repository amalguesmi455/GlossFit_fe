import { Injectable, OnDestroy } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, interval, Subscription, Observable } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';

import { Notification, UnreadCountResponse } from './Notification.models';
import { environment } from '../../environments/environment';

const BASE = `${environment.apiUrl}/notifications`;
const POLL_INTERVAL_MS = 30_000; // poll every 30 s

@Injectable({ providedIn: 'root' })
export class NotificationService implements OnDestroy {

  // ── Reactive state exposed to consumers ────────────────────────────────
  private _notifications$ = new BehaviorSubject<Notification[]>([]);
  private _unreadCount$   = new BehaviorSubject<number>(0);

  readonly notifications$ = this._notifications$.asObservable();
  readonly unreadCount$   = this._unreadCount$.asObservable();

  private pollSub: Subscription | null = null;

  constructor(private http: HttpClient) {}

  ngOnDestroy(): void {
    this.stopPolling();
  }

  // ── Polling ─────────────────────────────────────────────────────────────

  /** Call once after login to keep badge count live. */
  startPolling(): void {
    if (this.pollSub) return; // already running

    // Immediate first load, then every POLL_INTERVAL_MS
    this.fetchAll();
    this.pollSub = interval(POLL_INTERVAL_MS)
      .pipe(switchMap(() => this.http.get<Notification[]>(BASE).pipe(catchError(() => of([])))))
      .subscribe(notifications => this.applyNotifications(notifications));
  }

  stopPolling(): void {
    this.pollSub?.unsubscribe();
    this.pollSub = null;
  }

  // ── API calls ────────────────────────────────────────────────────────────

  /** GET /api/notifications — full history */
  fetchAll(): void {
    this.http.get<Notification[]>(BASE).pipe(
      catchError(() => of([] as Notification[]))
    ).subscribe(n => this.applyNotifications(n));
  }

  /** GET /api/notifications/unread */
  getUnread(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${BASE}/unread`);
  }

  /** GET /api/notifications/unread-count */
  getUnreadCount(): Observable<UnreadCountResponse> {
    return this.http.get<UnreadCountResponse>(`${BASE}/unread-count`);
  }

  /** PUT /api/notifications/{id}/read */
  markAsRead(notificationId: number): Observable<void> {
    return this.http.put<void>(`${BASE}/${notificationId}/read`, {}).pipe(
      tap(() => {
        const updated = this._notifications$.value.map(n =>
          n.id === notificationId ? { ...n, isRead: true } : n
        );
        this.applyNotifications(updated);
      })
    );
  }

  /** PUT /api/notifications/mark-all-read */
  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${BASE}/mark-all-read`, {}).pipe(
      tap(() => {
        const updated = this._notifications$.value.map(n => ({ ...n, isRead: true }));
        this.applyNotifications(updated);
      })
    );
  }

  // ── Internal helpers ─────────────────────────────────────────────────────

  private applyNotifications(notifications: Notification[]): void {
    this._notifications$.next(notifications);
    this._unreadCount$.next(notifications.filter(n => !n.isRead).length);
  }
}