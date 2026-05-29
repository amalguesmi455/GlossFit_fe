import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface StylingRequestUserRef {
  id?: number;
  userId?: number;
  user?: {
    id: number;
    email?: string;
  };
  email?: string;
  nom?: string;
  prenom?: string;
  ville?: string;
  taille?: string;
  morphologie?: string;
  style?: string;
}

export interface StylingRequest {
  id: number;
  fashionista?: StylingRequestUserRef;
  styliste?: StylingRequestUserRef;
  eventType: string;
  dressCode: string;
  place: string;
  eventDateTime: string;
  season: string;
  weather: string;
  theme: string;
  formalityLevel: string;
  description?: string;
  status: 'PENDING' | 'ACCEPTED' | 'REFUSED' | 'DONE' | string;
  completedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface StylingRequestCreatePayload {
  fashionistaId: number;
  stylisteId: number;
  eventType: string;
  dressCode: string;
  place: string;
  eventDateTime: string;
  season: string;
  weather: string;
  theme: string;
  formalityLevel: string;
  description: string;
}

@Injectable({
  providedIn: 'root',
})
export class StylingRequestService {
  private readonly apiUrl = `${environment.apiUrl}/styling-requests`;

  constructor(private http: HttpClient) {}

  createStylingRequest(payload: StylingRequestCreatePayload): Observable<StylingRequest> {
    return this.http.post<StylingRequest>(this.apiUrl, payload);
  }

  getByFashionista(fashionistaId: number): Observable<StylingRequest[]> {
    return this.http.get<StylingRequest[]>(`${this.apiUrl}/fashionista/${fashionistaId}`);
  }

  getByStyliste(stylisteId: number): Observable<StylingRequest[]> {
    return this.http.get<StylingRequest[]>(`${this.apiUrl}/styliste/${stylisteId}`);
  }

  acceptStylingRequest(requestId: number): Observable<StylingRequest> {
    return this.http.post<StylingRequest>(`${this.apiUrl}/${requestId}/accept`, {});
  }

  refuseStylingRequest(requestId: number): Observable<StylingRequest> {
    return this.http.post<StylingRequest>(`${this.apiUrl}/${requestId}/refuse`, {});
  }

  markStylingRequestAsDone(requestId: number): Observable<StylingRequest> {
    return this.http.post<StylingRequest>(`${this.apiUrl}/${requestId}/done`, {});
  }
}
