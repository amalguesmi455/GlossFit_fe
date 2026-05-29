import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { FashionistaProfile } from './fashionista-profile.service';
import { StylisteProfile } from './styliste-profile.service';

export interface AdminProfileData {
  userId: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}

export interface AdminProfile {
  id?: number;
  userId?: number;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  createdAt?: string;
  user?: {
    id?: number;
    email?: string;
    role?: string;
  };
}

export interface ApiMessage {
  message?: string;
  error?: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminProfileService {
  private readonly apiUrl = `${environment.apiUrl}/admin-profiles`;

  constructor(private http: HttpClient) {}

  createAdminProfile(profile: AdminProfileData): Observable<AdminProfile> {
    return this.http.post<AdminProfile>(this.apiUrl, null, {
      params: this.toParams(profile),
    });
  }

  getAdminProfile(profileId: number): Observable<AdminProfile> {
    return this.http.get<AdminProfile>(`${this.apiUrl}/${profileId}`);
  }

  getAllAdminProfiles(): Observable<AdminProfile[]> {
    return this.http.get<AdminProfile[]>(this.apiUrl);
  }

  updateAdminProfile(profileId: number, profile: Partial<Omit<AdminProfileData, 'userId'>>): Observable<AdminProfile> {
    return this.http.put<AdminProfile>(`${this.apiUrl}/${profileId}`, null, {
      params: this.toParams(profile),
    });
  }

  deleteAdminProfile(profileId: number): Observable<ApiMessage> {
    return this.http.delete<ApiMessage>(`${this.apiUrl}/${profileId}`);
  }

  getAllFashionistas(adminId?: number | null): Observable<FashionistaProfile[]> {
    const options = adminId != null
      ? { params: new HttpParams().set('adminId', adminId) }
      : undefined;

    return this.http.get<FashionistaProfile[]>(`${this.apiUrl}/fashionistas`, options);
  }

  getAllStylistes(adminId?: number | null): Observable<StylisteProfile[]> {
    const options = adminId != null
      ? { params: new HttpParams().set('adminId', adminId) }
      : undefined;

    return this.http.get<StylisteProfile[]>(`${this.apiUrl}/stylistes`, options);
  }

  private toParams(source: Partial<AdminProfileData>): HttpParams {
    let params = new HttpParams();

    Object.entries(source).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, String(value));
      }
    });

    return params;
  }
}
