import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { UserRole } from './auth/auth.models';

export interface DashboardStats {
  role: UserRole | string;

  totalLikes: number;
  totalDislikes: number;
  totalPosts: number;

  fashionistaCount: number;
  stylisteCount: number;

  totalRequests: number;
  acceptedRequests: number;
  refusedRequests: number;
  pendingRequests: number;

  fashionistaLikesMade: number;
  fashionistaDislikesMade: number;
  fashionistaRefusedLooks: number;

  stylisteLikesReceived: number;
  stylisteDislikesReceived: number;
  stylisteRefusedLooks: number;
}

@Injectable({
  providedIn: 'root',
})
export class DashboardStatsService {
  private readonly apiUrl = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(`${this.apiUrl}/stats`);
  }
}
