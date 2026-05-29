import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import {
  StylisteProfileService,
  StylisteProfile,
  StylisteProfileData,
} from '../core/styliste-profile.service';
import { AuthService } from '../core/auth/auth.service';
import { environment } from '../../environments/environment';

type ProfileChoice = {
  label: string;
  value: string;
  icon?: string;
};

// ─── Local view-model (flat, UI-friendly) ────────────────────────────────────
interface StylisteDraft {
  nom: string;
  prenom: string;
  specialty: string;
  city: string;
  style: string;
  portfolio: string;
  experienceYears: number;
  profilePicture: File | null;
}

@Component({
  selector: 'app-profil-styliste',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profil-styliste.component.html',
  styleUrl: './profil-styliste.component.css',
})
export class ProfilStylisteComponent implements OnInit, OnDestroy {

  private readonly userId: number;

  // ── State ────────────────────────────────────────────────────────────────
  profile: StylisteProfile | null = null;
  profilePictureUrl: string | null = null; // resolved absolute URL from DB
  avatarBlobUrl: string | null = null;     // authenticated blob URL, if available
  previewUrl: string | null = null;        // local blob preview after file pick

  draft: StylisteDraft = this.emptyDraft();

  readonly specialties: ProfileChoice[] = [
    { label: 'Conseil personnel', value: 'conseil-personnel', icon: 'fa-solid fa-person-hiking' },
    { label: 'Relooking', value: 'relooking', icon: 'fa-solid fa-wand-magic-sparkles' },
    { label: 'Couleurs & contrastes', value: 'couleurs', icon: 'fa-solid fa-palette' },
    { label: 'Shopping', value: 'shopping', icon: 'fa-solid fa-bag-shopping' },
    { label: 'Garde-robe', value: 'garde-robe', icon: 'fa-solid fa-closet' },
    { label: 'Evenementiel', value: 'evenementiel', icon: 'fa-solid fa-champagne-glasses' },
  ];

  readonly styleOptions: ProfileChoice[] = [
    { label: 'Classique', value: 'classique', icon: 'fa-solid fa-vest' },
    { label: 'Casual', value: 'casual', icon: 'fa-solid fa-shirt' },
    { label: 'Boheme', value: 'boheme', icon: 'fa-solid fa-leaf' },
    { label: 'Sportif', value: 'sportif', icon: 'fa-solid fa-dumbbell' },
    { label: 'Tendance', value: 'tendance', icon: 'fa-solid fa-star' },
    { label: 'Chic', value: 'chic', icon: 'fa-solid fa-crown' },
  ];

  loading   = true;
  saving    = false;
  isEditing = false;
  error: string | null = null;
  private avatarRequestSeq = 0;

  constructor(
    private stylisteService: StylisteProfileService,
    private authService: AuthService,
    private http: HttpClient,
  ) {
    const user = this.authService.currentUser;
    this.userId = user?.id ?? 0;
  }

  // ── Lifecycle ────────────────────────────────────────────────────────────
  ngOnInit(): void {
    this.loadProfile();
  }

  ngOnDestroy(): void {
    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);
    if (this.avatarBlobUrl) URL.revokeObjectURL(this.avatarBlobUrl);
  }

  // ── Data loading ─────────────────────────────────────────────────────────
  loadProfile(): void {
    this.loading = true;
    this.error   = null;

    this.stylisteService.getProfile(this.userId).subscribe({
      next: (data: StylisteProfile) => {
        this.profile           = data;
        this.profilePictureUrl = this.resolveProfilePictureUrl(data);
        this.fetchAvatarWithAuth(data);
        this.syncDraftFromProfile(data);
        this.loading = false;
      },
      error: (err: unknown) => {
        this.error   = 'Impossible de charger le profil. Veuillez réessayer.';
        this.loading = false;
        console.error('[ProfilStyliste] getProfile error:', err);
      },
    });
  }

  // ── Avatar helpers ───────────────────────────────────────────────────────
  /** Preview (just picked) takes priority over the DB URL */
  get displayPictureUrl(): string | null {
    return this.previewUrl ?? this.avatarBlobUrl ?? this.profilePictureUrl;
  }

  get initialsText(): string {
    const p = this.profile;
    if (!p) return '?';
    const first = (p.prenom ?? '').charAt(0).toUpperCase();
    const last  = (p.nom   ?? '').charAt(0).toUpperCase();
    return `${first}${last}` || '?';
  }

  get fullName(): string {
    if (!this.profile) return '';
    return `${this.profile.prenom} ${this.profile.nom}`.trim();
  }

  // ── Edit mode toggle ─────────────────────────────────────────────────────
  startEdit(): void {
    if (!this.profile) return;
    this.syncDraftFromProfile(this.profile);
    this.isEditing = true;
    this.error     = null;
  }

  cancelEdit(): void {
    if (this.previewUrl) {
      URL.revokeObjectURL(this.previewUrl);
      this.previewUrl            = null;
      this.draft.profilePicture  = null;
    }
    if (this.profile) this.syncDraftFromProfile(this.profile);
    this.isEditing = false;
    this.error     = null;
  }

  // ── File pick ────────────────────────────────────────────────────────────
  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0] ?? null;
    this.draft.profilePicture = file;

    if (this.previewUrl) URL.revokeObjectURL(this.previewUrl);

    if (file) {
      this.previewUrl = URL.createObjectURL(file);
    } else {
      this.previewUrl = null;
    }
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  save(): void {
    if (this.saving) return;
    this.saving = true;
    this.error  = null;

    const payload: StylisteProfileData = {
      nom:              this.draft.nom,
      prenom:           this.draft.prenom,
      ville:            this.draft.city,
      style:            this.draft.style,
      portfolio:        this.draft.portfolio,
      stylistSpecialty: this.draft.specialty,
      experienceYears:  this.draft.experienceYears,
      profilePicture:   this.draft.profilePicture,
    };

    this.stylisteService.updateProfile(this.userId, payload).subscribe({
      next: (updated: StylisteProfile) => {
        this.profile           = updated;
        this.profilePictureUrl = this.resolveProfilePictureUrl(updated);
        this.fetchAvatarWithAuth(updated);

        if (this.previewUrl) {
          URL.revokeObjectURL(this.previewUrl);
          this.previewUrl = null;
        }

        this.syncDraftFromProfile(updated);
        this.saving    = false;
        this.isEditing = false;

        void Swal.fire({
          icon: 'success',
          title: 'Fiche mise à jour',
          text: 'Tes informations ont bien été enregistrées.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#a46e51',
          timer: 2500,
          timerProgressBar: true,
        });
      },
      error: (err: unknown) => {
        this.error  = 'Erreur lors de la sauvegarde. Veuillez réessayer.';
        this.saving = false;
        console.error('[ProfilStyliste] updateProfile error:', err);
      },
    });
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  confirmDelete(): void {
    void Swal.fire({
      icon: 'warning',
      title: 'Supprimer le profil ?',
      text: 'Cette action est irréversible.',
      showCancelButton: true,
      confirmButtonText: 'Oui, supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#a46e51',
    }).then((result) => {
      if (!result.isConfirmed) return;
      this.stylisteService.deleteProfile(this.userId).subscribe({
        next: () => {
          void Swal.fire({ icon: 'success', title: 'Profil supprimé', confirmButtonColor: '#a46e51', timer: 2000 });
        },
        error: (err: unknown) => {
          void Swal.fire({ icon: 'error', title: 'Erreur', text: 'Impossible de supprimer le profil.', confirmButtonColor: '#a46e51' });
          console.error('[ProfilStyliste] deleteProfile error:', err);
        },
      });
    });
  }

  // ── Reset (cancel alias kept for template compatibility) ──────────────────
  reset(): void {
    this.cancelEdit();
  }

  // ── Helpers ───────────────────────────────────────────────────────────────
  private syncDraftFromProfile(p: StylisteProfile): void {
    this.draft = {
      nom:             p.nom              ?? '',
      prenom:          p.prenom           ?? '',
      specialty:       p.stylistSpecialty ?? '',
      city:            p.ville            ?? '',
      style:           p.style            ?? '',
      portfolio:       p.portfolio        ?? '',
      experienceYears: p.experienceYears  ?? 0,
      profilePicture:  null,
    };
  }

  private emptyDraft(): StylisteDraft {
    return {
      nom: '', prenom: '', specialty: '', city: '',
      style: '', portfolio: '', experienceYears: 0,
      profilePicture: null,
    };
  }

  private fetchAvatarWithAuth(profile: StylisteProfile): void {
    const picturePath = this.extractProfilePicturePath(profile);

    if (!picturePath) {
      if (this.avatarBlobUrl) {
        URL.revokeObjectURL(this.avatarBlobUrl);
        this.avatarBlobUrl = null;
      }
      return;
    }

    const requestSeq = ++this.avatarRequestSeq;
    const imageUrl = this.resolveImageUrl(picturePath);

    this.http.get(imageUrl, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        if (requestSeq !== this.avatarRequestSeq) return;

        if (this.avatarBlobUrl) {
          URL.revokeObjectURL(this.avatarBlobUrl);
        }

        this.avatarBlobUrl = URL.createObjectURL(blob);
      },
      error: () => {
        if (requestSeq === this.avatarRequestSeq && this.avatarBlobUrl) {
          URL.revokeObjectURL(this.avatarBlobUrl);
          this.avatarBlobUrl = null;
        }
      },
    });
  }

  private resolveProfilePictureUrl(profile: StylisteProfile): string | null {
    const picturePath = this.extractProfilePicturePath(profile);
    return picturePath ? this.resolveImageUrl(picturePath) : null;
  }

  private extractProfilePicturePath(profile: StylisteProfile): string | null {
    const raw = profile as unknown as Record<string, unknown>;
    const value =
      raw['profilePictureUrl']      ??
      raw['profilePictureFileName'] ??
      raw['profilePicture']         ??
      raw['pictureUrl']             ??
      raw['imageUrl']               ??
      raw['photoUrl']               ??
      raw['profileImageUrl']        ??
      raw['profile_image_url']      ??
      raw['avatarUrl']              ??
      null;

    return typeof value === 'string' && value.trim() ? value : null;
  }

  private resolveImageUrl(imagePath: string): string {
    const trimmed = imagePath.trim();
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
}
