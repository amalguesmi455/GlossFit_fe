import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface FashionistaProfileData {
  nom: string;
  prenom: string;
  ville: string;
  taille: string;
  poids: number | null;
  skinTone: string;
  morphologie: string;
  style: string;
  /** File when uploading; string (URL/path) when reading from the API; null when not set */
  profilePicture: File | string | null;
}

export interface FashionistaProfile extends FashionistaProfileData {
  id?: number;
  userId: number;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class FashionistaProfileService {

  private apiUrl = `${environment.apiUrl}/profiles/fashionista`;

  constructor(private http: HttpClient) {}

  createProfile(profileData: FashionistaProfileData, userId: number): Observable<FashionistaProfile> {
    return this.http.post<FashionistaProfile>(this.apiUrl, this.toFormData(profileData, userId));
  }

  getProfile(userId: number): Observable<FashionistaProfile> {
    return this.http.get<FashionistaProfile>(`${this.apiUrl}/${userId}`);
  }

  updateProfile(userId: number, profileData: FashionistaProfileData): Observable<FashionistaProfile> {
    return this.http.put<FashionistaProfile>(`${this.apiUrl}/${userId}`, this.toFormData(profileData));
  }

  deleteProfile(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }

  // ── Private helpers ─────────────────────────────────────────────────────────
  private toFormData(data: FashionistaProfileData, userId?: number): FormData {
    const fd = new FormData();
    fd.append('nom',         data.nom);
    fd.append('prenom',      data.prenom);
    fd.append('ville',       data.ville);
    fd.append('taille',      data.taille);
    fd.append('poids',       data.poids != null ? data.poids.toString() : '');
    fd.append('skinTone',    data.skinTone);
    fd.append('morphologie', data.morphologie);
    fd.append('style',       data.style);

    if (userId != null) {
      fd.append('userId', userId.toString());
    }

    // Only append when a new File is provided — skip if it's a string (existing URL) or null
    if (data.profilePicture instanceof File) {
      fd.append('profilePictureFile', data.profilePicture);
    }

    return fd;
  }
}