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
  active?: boolean;
  user?: {
    id?: number;
    email?: string;
    active?: boolean;
  };
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

    const trimmed = relativePath.trim();
    const baseUrl = environment.apiUrl.replace(/\/api$/, '');

    if (/^(https?:)?\/\//.test(trimmed) || trimmed.startsWith('data:')) {
      return trimmed;
    }

    if (trimmed.startsWith('/')) {
      return `${baseUrl}${trimmed}`;
    }

    if (trimmed.includes('/')) {
      return `${baseUrl}/${trimmed.replace(/^\/+/, '')}`;
    }

    return `${baseUrl}/uploads/profiles/${encodeURIComponent(trimmed)}`;
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

  updateAccountStatus(profile: StylisteProfile, active: boolean, userId?: number): Observable<StylisteProfile> {
    const resolvedUserId = userId ?? profile.userId ?? profile.user?.id;

    if (!resolvedUserId) {
      throw new Error('User ID missing.');
    }

    const formData = this.buildFormData(profile);
    formData.append('active', String(active));
    return this.http.put<StylisteProfile>(`${this.apiUrl}/${resolvedUserId}`, formData);
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
