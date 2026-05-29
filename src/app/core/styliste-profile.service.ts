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
  profilePictureUrl?: string; // ✅ URL returned by the backend (stored path in DB)
  createdAt?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StylisteProfileService {

  private apiUrl = `${environment.apiUrl}/profiles/styliste`;

  constructor(private http: HttpClient) {}

  // ✅ Resolves a stored relative path from the DB into a full URL
  getProfilePictureUrl(relativePath: string | undefined): string | null {
    if (!relativePath) return null;
    // If the backend already returns an absolute URL, return it as-is
    if (relativePath.startsWith('http')) return relativePath;
    return `${environment.apiUrl}/${relativePath}`;
  }

  createProfile(profileData: StylisteProfileData, userId: number): Observable<StylisteProfile> {
    const formData = this.buildFormData(profileData);
    formData.append('userId', userId.toString());
    return this.http.post<StylisteProfile>(this.apiUrl, formData);
  }

  getProfile(userId: number): Observable<StylisteProfile> {
    return this.http.get<StylisteProfile>(`${this.apiUrl}/${userId}`);
  }

  getAllProfiles(): Observable<StylisteProfile[]> {
    return this.http.get<StylisteProfile[]>(this.apiUrl);
  }

  updateProfile(userId: number, profileData: StylisteProfileData): Observable<StylisteProfile> {
    const formData = this.buildFormData(profileData);
    return this.http.put<StylisteProfile>(`${this.apiUrl}/${userId}`, formData);
  }

  deleteProfile(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${userId}`);
  }

  // ✅ Shared FormData builder — avoids duplication between create/update
  private buildFormData(profileData: StylisteProfileData): FormData {
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
    return formData;
  }
}