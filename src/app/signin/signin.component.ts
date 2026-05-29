import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

import { AuthService } from '../core/auth/auth.service';
import { AuthUser } from '../core/auth/auth.models';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signin.component.html',
  styleUrls: ['./signin.component.css']
})
export class SigninComponent {

  email = '';
  password = '';
  message = '';
  isLoading = false;
  isForgotMode = false;
  forgotEmail = '';
  forgotMessage = '';
  isForgotLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  signin(): void {
    this.message = '';
    this.isLoading = true;

    this.authService.signIn({
      email: this.email,
      password: this.password
    }).subscribe({

      next: (user: AuthUser) => {
        this.isLoading = false;

        // ✅ AuthService.storeSession() already persists the user to localStorage.
        // Do NOT call localStorage.setItem('glossfit_user') here — it would
        // overwrite the session with a stale object that may be missing fields.

        void Swal.fire({
          icon: 'success',
          title: 'Connexion réussie',
          text: 'Bienvenue sur GlossFit.',
          confirmButtonText: 'Continuer',
          confirmButtonColor: '#a46e51',
        });

        void this.router.navigate([this.getProfileRoute(user)]);
      },

      error: (error: Error) => {
        this.isLoading = false;
        this.message = error.message;

        void Swal.fire({
          icon: 'error',
          title: 'Connexion impossible',
          text: this.message,
          confirmButtonText: 'Réessayer',
          confirmButtonColor: '#a46e51',
        });
      }
    });
  }

  toggleForgotMode(): void {
    this.isForgotMode = !this.isForgotMode;
    this.message = '';
    this.forgotMessage = '';
    if (this.isForgotMode && !this.forgotEmail) {
      this.forgotEmail = this.email;
    }
  }

  sendPasswordReset(): void {
    this.forgotMessage = '';
    this.isForgotLoading = true;

    this.authService.requestPasswordReset({ email: this.forgotEmail }).subscribe({
      next: (response) => {
        this.isForgotLoading = false;
        this.forgotMessage = response.message || 'Vérifier votre email pour la réinitialisation du mot de passe.';
        void Swal.fire({
          icon: 'success',
          title: 'Email envoyé',
          text: this.forgotMessage,
          confirmButtonText: 'OK',
          confirmButtonColor: '#a46e51',
        });
      },
      error: (error: Error) => {
        this.isForgotLoading = false;
        this.forgotMessage = error.message;
        void Swal.fire({
          icon: 'error',
          title: 'Demande impossible',
          text: this.forgotMessage,
          confirmButtonText: 'Réessayer',
          confirmButtonColor: '#a46e51',
        });
      }
    });
  }

  // ================= ROUTING LOGIC =================
  private getProfileRoute(user: AuthUser): string {
    if (user.role === 'ADMIN') {
      return '/adminDashbord';
    }

    if (user.role === 'STYLISTE') {
      return user.hasProfile
        ? `/profilestyliste/${user.id}`
        : `/createprofilestyliste/${user.id}`;
    }

    // FASHIONISTA
    return user.hasProfile
      ? `/profilefashionista/${user.id}`
      : `/createprofilefashionista/${user.id}`;
  }
}
