import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';

import { FashionistaProfileService, FashionistaProfile, FashionistaProfileData } from '../core/fashionista-profile.service';
import { AuthService } from '../core/auth/auth.service';
import { environment } from '../../environments/environment';

type ProfileChoice = {
  label: string;
  value: string;
  icon?: string;
  color?: string;
};

@Component({
  selector: 'app-profil-fashionista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profil-fashionista.component.html',
  styleUrl: './profil-fashionista.component.css'
})
export class ProfilFashionistaComponent implements OnInit, OnDestroy {

  profile: FashionistaProfile | null = null;
  isLoading = true;
  isSaving  = false;

  /** Blob URL created from the authenticated image fetch — safe for <img [src]> */
  avatarBlobUrl: string | null = null;
  /** Temporary blob URL for a newly chosen file (before save) */
  avatarPreview: string | null = null;
  newPictureFile: File | null = null;

  /** Controls whether the form is in edit mode */
  isEditing = false;

  draft: FashionistaProfileData = this.emptyDraft();

  readonly tailles: ProfileChoice[] = [
    { label: 'Petite', value: 'petite' },
    { label: 'Moyenne', value: 'moyenne' },
    { label: 'Grande', value: 'grande' },
  ];

  readonly skinTones: ProfileChoice[] = [
    { label: 'Clair', value: 'clair', icon: 'fa-solid fa-circle', color: '#fdbcb4' },
    { label: 'Moyen', value: 'moyen', icon: 'fa-solid fa-circle', color: '#c19a6b' },
    { label: 'Foncé', value: 'fonce', icon: 'fa-solid fa-circle', color: '#4a4a4a' },
  ];

  readonly morphologies: ProfileChoice[] = [
    { label: 'Sablier', value: 'sablier', icon: 'fa-solid fa-hourglass-end' },
    { label: 'Poire', value: 'poire', icon: 'fa-solid fa-apple-whole' },
    { label: 'Rectangle', value: 'rectangle', icon: 'fa-solid fa-square' },
    { label: 'Triangle inversé', value: 'triangle_inverse', icon: 'fa-solid fa-caret-up' },
    { label: 'Ronde', value: 'ronde', icon: 'fa-solid fa-circle' },
    { label: 'Ovale', value: 'ovale', icon: 'fa-solid fa-egg' },
    { label: 'Diamant', value: 'diamant', icon: 'fa-solid fa-gem' },
    { label: 'Athlétique', value: 'athletique', icon: 'fa-solid fa-dumbbell' },
    { label: 'Fine', value: 'fine', icon: 'fa-solid fa-minus' },
    { label: 'Pulpeuse', value: 'pulpeuse', icon: 'fa-solid fa-heart' },
  ];

  readonly styleOptions: ProfileChoice[] = [
    { label: 'Classique', value: 'classique', icon: 'fa-solid fa-shirt' },
    { label: 'Casual', value: 'casual', icon: 'fa-solid fa-tshirt' },
    { label: 'Chic', value: 'chic', icon: 'fa-solid fa-crown' },
  ];

  private userId!: number;

  constructor(
    private profileService: FashionistaProfileService,
    private authService: AuthService,
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  ngOnInit(): void {
    const paramId = this.route.snapshot.paramMap.get('id');
    const user    = this.authService.currentUser;

    if (!user) { void this.router.navigate(['/signin']); return; }

    this.userId = paramId ? +paramId : user.id;

    if (history.state?.profileCreated) {
      void Swal.fire({
        icon: 'success',
        title: 'Profil créé !',
        text: 'Ton profil fashionista est prêt.',
        confirmButtonText: 'Super !',
        confirmButtonColor: '#a46e51',
        timer: 3000,
        timerProgressBar: true,
      });
    }

    this.loadProfile();
  }

  ngOnDestroy(): void {
    // Release blob URLs to avoid memory leaks
    this.revokeBlobUrls();
  }

  // ── Data ───────────────────────────────────────────────────────────────────
  private loadProfile(): void {
    this.isLoading = true;

    this.profileService.getProfile(this.userId).subscribe({
      next: (data) => {
        this.profile   = data;
        this.draft     = this.profileToDraft(data);
        this.isLoading = false;
        this.fetchAvatarWithAuth(data);
      },
      error: (err) => {
        this.isLoading = false;
        void Swal.fire({
          icon: 'error',
          title: 'Impossible de charger le profil',
          text: err?.message || 'Une erreur est survenue.',
          confirmButtonColor: '#a46e51',
        });
      }
    });
  }

  /**
   * Fetch the profile image through HttpClient so the auth interceptor
   * automatically adds the Bearer token.
   *
   * Tries every field name the backend might use for the picture path.
   * Check the browser console for "[Avatar]" lines to see exactly what
   * the API returned and which URL was built.
   */
  private fetchAvatarWithAuth(profile: FashionistaProfile): void {
    const raw = profile as unknown as Record<string, unknown>;

    // Log the full profile so you can confirm the real field name
    console.log('[Avatar] full profile object:', raw);

    // Try every common backend field name variant
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

    if (!value || typeof value !== 'string') {
      console.warn('[Avatar] no picture field found — showing initials. Keys present:', Object.keys(raw));
      return;
    }

    // Build absolute URL
    // If value is a bare filename (no slashes), prepend /uploads/
    // If value is already a path like /uploads/file.png, use it directly
    const baseUrl = environment.apiUrl.replace(/\/api$/, '');
    const isAbsolute = /^(https?:)?\/\//.test(value);
    const isPath     = value.includes('/');
    const url = isAbsolute
      ? value
      : isPath
        ? `${baseUrl}/${value.replace(/^\/+/, '')}`
        : `${baseUrl}/uploads/profiles/${encodeURIComponent(value)}`;

    console.log('[Avatar] fetching from URL:', url);

    this.http.get(url, { responseType: 'blob' }).subscribe({
      next: (blob) => {
        if (this.avatarBlobUrl) URL.revokeObjectURL(this.avatarBlobUrl);
        this.avatarBlobUrl = URL.createObjectURL(blob);
        console.log('[Avatar] image loaded successfully');
      },
      error: (err: unknown) => {
        // Log real error details — this is where the 500 status appears
        console.error('[Avatar] failed to fetch image (see details):', err);
        this.avatarBlobUrl = null;
        // Falls back to initials automatically via displayAvatar getter
      }
    });
  }

  // ── Avatar ─────────────────────────────────────────────────────────────────
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file  = input.files?.[0];
    if (!file) return;

    if (this.avatarPreview) URL.revokeObjectURL(this.avatarPreview);

    this.newPictureFile = file;
    this.avatarPreview  = URL.createObjectURL(file);
  }

  /** Preview first, then authenticated blob, then null (shows initials) */
  get displayAvatar(): string | null {
    return this.avatarPreview ?? this.avatarBlobUrl ?? null;
  }

  get avatarInitial(): string {
    if (!this.profile) return '?';
    return `${this.profile.prenom} ${this.profile.nom}`.trim().charAt(0).toUpperCase();
  }

  getSkintoneColor(value: string): string {
    return this.skinTones.find((tone) => tone.value === value)?.color || '#000';
  }

  // ── Edit mode toggle ───────────────────────────────────────────────────────
  startEdit(): void {
    if (!this.profile) return;
    this.draft     = this.profileToDraft(this.profile);
    this.isEditing = true;
  }

  cancelEdit(): void {
    if (this.avatarPreview) {
      URL.revokeObjectURL(this.avatarPreview);
      this.avatarPreview  = null;
      this.newPictureFile = null;
    }
    if (this.profile) this.draft = this.profileToDraft(this.profile);
    this.isEditing = false;
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  save(): void {
    if (this.isSaving) return;
    this.draft.profilePicture = this.newPictureFile;
    this.isSaving = true;

    this.profileService.updateProfile(this.userId, this.draft).subscribe({
      next: (updated) => {
        this.isSaving       = false;
        this.isEditing      = false;
        this.profile        = updated;
        this.newPictureFile = null;

        // If user picked a new photo, replace the blob URL
        if (this.avatarPreview) {
          URL.revokeObjectURL(this.avatarPreview);
          this.avatarPreview = null;
        }
        this.fetchAvatarWithAuth(updated);
        this.draft = this.profileToDraft(updated);

        void Swal.fire({
          icon: 'success',
          title: 'Profil mis à jour',
          text: 'Tes informations ont bien été enregistrées.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#a46e51',
          timer: 2500,
          timerProgressBar: true,
        });
      },
      error: (err) => {
        this.isSaving = false;
        void Swal.fire({
          icon: 'error',
          title: 'Erreur lors de la sauvegarde',
          text: err?.message || 'Veuillez réessayer.',
          confirmButtonColor: '#a46e51',
        });
      }
    });
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
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
      this.profileService.deleteProfile(this.userId).subscribe({
        next: () => {
          this.authService.updateHasProfile(false);
          void Swal.fire({ icon: 'success', title: 'Profil supprimé', confirmButtonColor: '#a46e51', timer: 2000 });
          void this.router.navigate(['/']);
        },
        error: (err) => {
          void Swal.fire({ icon: 'error', title: 'Erreur', text: err?.message || 'Impossible de supprimer le profil.', confirmButtonColor: '#a46e51' });
        }
      });
    });
  }

  // ── Helpers ────────────────────────────────────────────────────────────────
  private revokeBlobUrls(): void {
    if (this.avatarBlobUrl)  URL.revokeObjectURL(this.avatarBlobUrl);
    if (this.avatarPreview)  URL.revokeObjectURL(this.avatarPreview);
  }

  private profileToDraft(p: FashionistaProfile): FashionistaProfileData {
    return {
      nom: p.nom, prenom: p.prenom, ville: p.ville,
      taille: p.taille, poids: p.poids,
      skinTone: p.skinTone, morphologie: p.morphologie,
      style: p.style, profilePicture: null,
    };
  }

  private emptyDraft(): FashionistaProfileData {
    return { nom: '', prenom: '', ville: '', taille: '', poids: null, skinTone: '', morphologie: '', style: '', profilePicture: null };
  }
}
