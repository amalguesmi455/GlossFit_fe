import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { AuthService } from '../core/auth/auth.service';
import { AuthUser } from '../core/auth/auth.models';
import { AdminProfileService } from '../core/admin-profile.service';
import { FashionistaProfileService } from '../core/fashionista-profile.service';
import { StylisteProfileService } from '../core/styliste-profile.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css',
})
export class SettingsComponent implements OnInit {
  user: AuthUser | null = null;
  displayName = '';
  roleLabel = '';
  loading = true;
  requestingReset = false;
  deletingAccount = false;
  message = '';

  constructor(
    private authService: AuthService,
    private fashionistaProfileService: FashionistaProfileService,
    private stylisteProfileService: StylisteProfileService,
    private adminProfileService: AdminProfileService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (!user) {
      void this.router.navigate(['/signin']);
      return;
    }

    this.user = user;
    this.roleLabel = this.getRoleLabel(user.role);
    this.displayName = user.email;
    this.loadUserInfo(user);
  }

  requestPasswordReset(): void {
    this.message = '';

    if (!this.user?.email) {
      this.message = 'Impossible de récupérer l’adresse email du compte.';
      return;
    }

    this.requestingReset = true;
    this.authService.requestPasswordReset({
      email: this.user.email,
    }).subscribe({
      next: async (response) => {
        this.requestingReset = false;

        await Swal.fire({
          icon: 'success',
          title: 'Email envoyé',
          text: response.message || 'Un lien de réinitialisation a été envoyé à votre adresse email.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#a46e51',
        });
      },
      error: (error: Error) => {
        this.requestingReset = false;
        this.message = error.message;
      },
    });
  }

  deleteAccount(): void {
    if (!this.user || !this.canDeleteAccount()) {
      this.message = 'La suppression du compte est reservee aux fashionistas et stylistes.';
      return;
    }

    void Swal.fire({
      icon: 'warning',
      title: 'Supprimer le compte ?',
      text: 'Cette action est definitive. Vous pourrez recreer un compte avec le meme email apres 30 jours.',
      showCancelButton: true,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#a44d3d',
      cancelButtonColor: '#a46e51',
    }).then(result => {
      if (!result.isConfirmed) {
        return;
      }

      this.deletingAccount = true;

      this.authService.deleteCurrentAccount().subscribe({
        next: async (response) => {
          this.deletingAccount = false;
          await Swal.fire({
            icon: 'success',
            title: 'Compte supprime',
            text: response.message || 'Votre compte a ete supprime.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#a46e51',
          });
          this.authService.logout();
          void this.router.navigate(['/signin']);
        },
        error: (error: Error) => {
          this.deletingAccount = false;
          this.message = error.message;
        },
      });
    });
  }

  private loadUserInfo(user: AuthUser): void {
    if (user.role === 'FASHIONISTA') {
      this.fashionistaProfileService.getProfile(user.id).subscribe({
        next: (profile) => {
          this.displayName = `${profile.prenom} ${profile.nom}`.trim() || user.email;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
      return;
    }

    if (user.role === 'STYLISTE') {
      this.stylisteProfileService.getProfile(user.id).subscribe({
        next: (profile) => {
          this.displayName = `${profile.prenom} ${profile.nom}`.trim() || user.email;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
        },
      });
      return;
    }

    this.adminProfileService.getAdminProfile(user.id).subscribe({
      next: (profile) => {
        this.displayName = `${profile.firstName} ${profile.lastName}`.trim() || user.email;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  private getRoleLabel(role: AuthUser['role']): string {
    const labels: Record<string, string> = {
      ADMIN: 'Admin',
      FASHIONISTA: 'Fashionista',
      STYLISTE: 'Styliste',
    };
    return labels[role] || 'Utilisateur';
  }

  private canDeleteAccount(): boolean {
    return this.user?.role === 'FASHIONISTA' || this.user?.role === 'STYLISTE';
  }
}
