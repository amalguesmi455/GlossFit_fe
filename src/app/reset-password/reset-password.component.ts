import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css',
})
export class ResetPasswordComponent implements OnInit {
  token = '';
  newPassword = '';
  confirmPassword = '';
  isLoading = false;
  message = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.token = this.route.snapshot.queryParamMap.get('token') || '';
    if (!this.token) {
      this.message = 'Le lien de réinitialisation est invalide ou incomplet.';
    }
  }

  resetPassword(): void {
    this.message = '';

    if (!this.token) {
      this.message = 'Le lien de réinitialisation est invalide ou incomplet.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.message = 'Les mots de passe ne correspondent pas.';
      return;
    }

    this.isLoading = true;
    this.authService.resetPassword({ token: this.token, newPassword: this.newPassword }).subscribe({
      next: (response) => {
        this.isLoading = false;
        void Swal.fire({
          icon: 'success',
          title: 'Mot de passe réinitialisé',
          text: response.message || 'Votre mot de passe a été mis à jour. Vous allez devoir vous reconnecter.',
          confirmButtonText: 'Aller au login',
          confirmButtonColor: '#a46e51',
        }).then(() => {
          this.authService.logout();
          void this.router.navigate(['/signin']);
        });
      },
      error: (error: Error) => {
        this.isLoading = false;
        this.message = error.message;
      },
    });
  }
}
