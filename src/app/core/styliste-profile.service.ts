import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface StylisteProfileData {
  nom: string;
  prenom: string;
  ville: string;
  style: string;
  portfolio: string;
  stylistSpecialty: string;
  experienceYears: number;
  profilePicture: File | null;
}

export interface StylisteProfile extends StylisteProfileData {
  id?: number;
  userId: number;
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StylisteProfileService {

  private apiUrl = `${environment.apiUrl}/profiles/styliste`;

  // ✅ HttpClient only — the auth interceptor adds the Bearer token automatically
  constructor(private http: HttpClient) {}

  createProfile(profileData: StylisteProfileData, userId: number): Observable<StylisteProfile> {
    const formData = new FormData();

    formData.append('nom', profileData.nom);
    formData.append('prenom', profileData.prenom);
    formData.append('ville', profileData.ville);
    formData.append('experienceYears', profileData.experienceYears.toString());
    formData.append('stylistSpecialty', profileData.stylistSpecialty);
    formData.append('style', profileData.style);
    formData.append('portfolio', profileData.portfolio);
    formData.append('userId', userId.toString());

    if (profileData.profilePicture) {
      formData.append('profilePictureFile', profileData.profilePicture);
    }

    // ✅ No explicit headers — interceptor handles Authorization
    return this.http.post<StylisteProfile>(this.apiUrl, formData);
  }

  getProfile(userId: number): Observable<StylisteProfile> {
    return this.http.get<StylisteProfile>(`${this.apiUrl}/${userId}`);
  }

  updateProfile(userId: number, profileData: StylisteProfileData): Observable<StylisteProfile> {
    const formData = new FormData();

    formData.append('nom', profileData.nom);
    formData.append('prenom', profileData.prenom);
    formData.append('ville', profileData.ville);
    formData.append('experienceYears', profileData.experienceYears.toString());
    formData.append('stylistSpecialty', profileData.stylistSpecialty);
    formData.append('style', profileData.style);
    formData.append('portfolio', profileData.portfolio);

    if (profileData.profilePicture) {
      formData.append('profilePictureFile', profileData.profilePicture);
    }

    return this.http.put<StylisteProfile>(`${this.apiUrl}/${userId}`, formData);
  }

  deleteProfile(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }
}