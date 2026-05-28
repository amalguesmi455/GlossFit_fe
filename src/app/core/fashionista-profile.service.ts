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
  profilePicture: File | null;
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

  // ✅ HttpClient only — the auth interceptor adds the Bearer token automatically
  constructor(private http: HttpClient) {}

  createProfile(profileData: FashionistaProfileData, userId: number): Observable<FashionistaProfile> {
    const formData = new FormData();

    formData.append('nom', profileData.nom);
    formData.append('prenom', profileData.prenom);
    formData.append('ville', profileData.ville);
    formData.append('taille', profileData.taille);
    formData.append('poids', profileData.poids ? profileData.poids.toString() : '');
    formData.append('skinTone', profileData.skinTone);
    formData.append('morphologie', profileData.morphologie);
    formData.append('style', profileData.style);
    formData.append('userId', userId.toString());

    if (profileData.profilePicture) {
      formData.append('profilePictureFile', profileData.profilePicture);
    }

    // ✅ No explicit headers — interceptor handles Authorization
    return this.http.post<FashionistaProfile>(this.apiUrl, formData);
  }

  getProfile(userId: number): Observable<FashionistaProfile> {
    return this.http.get<FashionistaProfile>(`${this.apiUrl}/${userId}`);
  }

  updateProfile(userId: number, profileData: FashionistaProfileData): Observable<FashionistaProfile> {
    const formData = new FormData();

    formData.append('nom', profileData.nom);
    formData.append('prenom', profileData.prenom);
    formData.append('ville', profileData.ville);
    formData.append('taille', profileData.taille);
    formData.append('poids', profileData.poids ? profileData.poids.toString() : '');
    formData.append('skinTone', profileData.skinTone);
    formData.append('morphologie', profileData.morphologie);
    formData.append('style', profileData.style);

    if (profileData.profilePicture) {
      formData.append('profilePictureFile', profileData.profilePicture);
    }

    return this.http.put<FashionistaProfile>(`${this.apiUrl}/${userId}`, formData);
  }

  deleteProfile(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }
}