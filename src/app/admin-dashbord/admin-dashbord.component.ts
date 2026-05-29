import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';
import Swal from 'sweetalert2';

import { AdminProfile, AdminProfileData, AdminProfileService } from '../core/admin-profile.service';
import { AuthService } from '../core/auth/auth.service';
import { FashionistaProfile } from '../core/fashionista-profile.service';
import { StylisteProfile } from '../core/styliste-profile.service';

type AdminTab = 'fashionistas' | 'stylistes' | 'admins';

@Component({
  selector: 'app-admin-dashbord',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-dashbord.component.html',
  styleUrl: './admin-dashbord.component.css'
})
export class AdminDashbordComponent implements OnInit {
  activeTab: AdminTab = 'fashionistas';
  isLoading = false;
  isSaving = false;
  message = '';
  showAdminForm = false;
  profileLookupId: number | null = null;
  selectedAdminProfile: AdminProfile | null = null;

  adminForm: AdminProfileData = {
    userId: 0,
    firstName: '',
    lastName: '',
    phoneNumber: '',
  };

  fashionistas: FashionistaProfile[] = [];
  stylistes: StylisteProfile[] = [];
  adminProfiles: AdminProfile[] = [];

  constructor(
    private adminProfileService: AdminProfileService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.adminForm.userId = this.adminId ?? 0;
    if (!this.ensureAdminAccess()) {
      return;
    }

    this.loadProfiles();
  }

  get adminId(): number | null {
    return this.authService.currentUser?.id ?? null;
  }

  get activeCount(): number {
    if (this.activeTab === 'admins') {
      return this.adminProfiles.length;
    }

    return this.activeTab === 'fashionistas' ? this.fashionistas.length : this.stylistes.length;
  }

  get activeProfiles(): Array<FashionistaProfile | StylisteProfile> {
    return this.activeTab === 'fashionistas' ? this.fashionistas : this.stylistes;
  }

  switchTab(tab: AdminTab): void {
    this.activeTab = tab;
    this.message = '';
    this.showAdminForm = false;
  }

  loadProfiles(): void {
    if (!this.ensureAdminAccess()) {
      return;
    }

    const adminId = this.adminId;
    if (!adminId) {
      this.message = 'Admin not connected.';
      void this.showError(this.message);
      return;
    }

    this.isLoading = true;
    this.message = '';

    if (this.activeTab === 'admins') {
      this.adminProfileService.getAllAdminProfiles()
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (profiles: AdminProfile[]) => this.adminProfiles = profiles,
          error: (error: any) => this.handleError(error, 'Unable to load admin profiles.'),
        });
      return;
    }

    if (this.activeTab === 'fashionistas') {
      this.adminProfileService.getAllFashionistas(adminId)
        .pipe(finalize(() => this.isLoading = false))
        .subscribe({
          next: (profiles: FashionistaProfile[]) => this.fashionistas = profiles,
          error: (error: any) => this.handleError(error, 'Unable to load profiles.'),
        });
      return;
    }

    this.adminProfileService.getAllStylistes(adminId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: (profiles: StylisteProfile[]) => this.stylistes = profiles,
        error: (error: any) => this.handleError(error, 'Unable to load profiles.'),
      });
  }

  saveAdminProfile(): void {
    if (!this.adminForm.userId || !this.adminForm.firstName || !this.adminForm.lastName || !this.adminForm.phoneNumber) {
      this.message = 'Please fill all admin profile fields.';
      void this.showError(this.message);
      return;
    }

    this.isSaving = true;
    this.message = '';
    const selectedProfileId = this.selectedAdminProfile?.id;
    const isUpdate = !!selectedProfileId;

    const request = isUpdate
      ? this.adminProfileService.updateAdminProfile(selectedProfileId, {
          firstName: this.adminForm.firstName,
          lastName: this.adminForm.lastName,
          phoneNumber: this.adminForm.phoneNumber,
        })
      : this.adminProfileService.createAdminProfile(this.adminForm);

    request.pipe(finalize(() => this.isSaving = false)).subscribe({
      next: profile => {
        this.selectedAdminProfile = profile;
        this.profileLookupId = profile.id ?? null;
        this.adminForm = {
          userId: this.resolveProfileUserId(profile),
          firstName: profile.firstName,
          lastName: profile.lastName,
          phoneNumber: profile.phoneNumber,
        };
        this.upsertAdminProfile(profile);
        this.showAdminForm = false;
        this.message = isUpdate ? 'Admin profile saved.' : 'Admin profile created.';
        void this.showSuccess(this.message);
      },
      error: error => this.handleError(error, 'Unable to save admin profile.'),
    });
  }

  findAdminProfile(): void {
    if (!this.profileLookupId) {
      this.message = 'Enter an admin profile ID.';
      void this.showError(this.message);
      return;
    }

    this.isLoading = true;
    this.message = '';

    this.adminProfileService.getAdminProfile(this.profileLookupId)
      .pipe(finalize(() => this.isLoading = false))
      .subscribe({
        next: profile => {
          this.selectedAdminProfile = profile;
          this.adminForm = {
            userId: this.resolveProfileUserId(profile),
            firstName: profile.firstName,
            lastName: profile.lastName,
            phoneNumber: profile.phoneNumber,
          };
        },
        error: error => this.handleError(error, 'Admin profile not found.'),
      });
  }

  deleteAdminProfile(): void {
    if (!this.selectedAdminProfile?.id) {
      this.message = 'Load an admin profile before deleting it.';
      void this.showError(this.message);
      return;
    }

    this.performDelete(this.selectedAdminProfile);
  }

  async removeAdminProfile(profile: AdminProfile): Promise<void> {
    const result = await Swal.fire({
      icon: 'warning',
      title: 'Supprimer cet admin ?',
      text: `${this.adminName(profile)} sera retire de la liste des profils admin.`,
      showCancelButton: true,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#c0503a',
      cancelButtonColor: '#a46e51',
    });

    if (!result.isConfirmed) {
      return;
    }

    this.performDelete(profile);
  }

  private performDelete(profile: AdminProfile): void {
    if (!profile.id) {
      this.message = 'Admin profile ID missing.';
      void this.showError(this.message);
      return;
    }

    this.isSaving = true;
    this.message = '';
    const deletedProfileId = profile.id;

    this.adminProfileService.deleteAdminProfile(deletedProfileId)
      .pipe(finalize(() => this.isSaving = false))
      .subscribe({
        next: response => {
          this.selectedAdminProfile = null;
          this.profileLookupId = null;
          this.adminForm = {
            userId: this.adminId ?? 0,
            firstName: '',
            lastName: '',
            phoneNumber: '',
          };
          this.adminProfiles = this.adminProfiles.filter(profile => profile.id !== deletedProfileId);
          this.showAdminForm = false;
          this.message = response.message || 'Admin profile deleted.';
          void this.showSuccess(this.message);
        },
        error: error => this.handleError(error, 'Unable to delete admin profile.'),
      });
  }

  resetAdminForm(): void {
    this.selectedAdminProfile = null;
    this.profileLookupId = null;
    this.adminForm = {
      userId: this.adminId ?? 0,
      firstName: '',
      lastName: '',
      phoneNumber: '',
    };
    this.message = '';
    this.showAdminForm = true;
  }

  editAdminProfile(profile: AdminProfile): void {
    this.selectedAdminProfile = profile;
    this.profileLookupId = profile.id ?? null;
    this.adminForm = {
      userId: this.resolveProfileUserId(profile),
      firstName: profile.firstName,
      lastName: profile.lastName,
      phoneNumber: profile.phoneNumber,
    };
    this.message = '';
    this.showAdminForm = true;
  }

  adminName(profile: AdminProfile): string {
    return `${profile.firstName || ''} ${profile.lastName || ''}`.trim() || 'Admin without name';
  }

  profileName(profile: FashionistaProfile | StylisteProfile): string {
    return `${profile.prenom || ''} ${profile.nom || ''}`.trim() || 'Profile without name';
  }

  private resolveProfileUserId(profile: AdminProfile): number {
    return profile.userId ?? profile.user?.id ?? this.adminId ?? 0;
  }

  private upsertAdminProfile(profile: AdminProfile): void {
    if (!profile.id) {
      return;
    }

    const index = this.adminProfiles.findIndex(item => item.id === profile.id);

    if (index >= 0) {
      this.adminProfiles[index] = profile;
      return;
    }

    this.adminProfiles = [profile, ...this.adminProfiles];
  }

  private readError(error: any, fallback: string): string {
    if (error?.status === 403) {
      return 'Acces refuse: connecte-toi avec un compte ADMIN. Le compte actuel ne peut pas consulter ces profils.';
    }

    if (error?.status === 401) {
      return 'Session expiree: reconnecte-toi avec un compte ADMIN.';
    }

    return error?.error?.error || error?.error?.message || error?.message || fallback;
  }

  private handleError(error: any, fallback: string): void {
    this.message = this.readError(error, fallback);
    void this.showError(this.message);
  }

  private showSuccess(message: string): Promise<any> {
    return Swal.fire({
      icon: 'success',
      title: 'Succes',
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: '#a46e51',
      timer: 1800,
      timerProgressBar: true,
    });
  }

  private showError(message: string): Promise<any> {
    return Swal.fire({
      icon: 'error',
      title: 'Action impossible',
      text: message,
      confirmButtonText: 'OK',
      confirmButtonColor: '#a46e51',
    });
  }

  private ensureAdminAccess(): boolean {
    const user = this.authService.currentUser;

    if (!user) {
      this.message = 'Session expiree: reconnecte-toi avec un compte ADMIN.';
      void this.showError(this.message);
      return false;
    }

    if (user.role !== 'ADMIN') {
      this.message = 'Acces refuse: cette page est reservee aux administrateurs.';
      void this.showError(this.message);
      return false;
    }

    return true;
  }
}
