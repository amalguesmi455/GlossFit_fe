import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-verify-email',
  imports: [CommonModule, RouterLink],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.css',
})
export class VerifyEmailComponent implements OnInit {
  isLoading = true;
  message = 'Verification de votre email en cours...';
  isVerified = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const token = this.route.snapshot.queryParamMap.get('token');

    if (!token) {
      this.isLoading = false;
      this.message = 'Token de verification manquant.';
      void Swal.fire({
        icon: 'warning',
        title: 'Lien invalide',
        text: this.message,
        confirmButtonText: 'Retour',
        confirmButtonColor: '#a46e51',
      });
      return;
    }

    this.authService.verifyEmail(token).subscribe({
      next: response => {
        this.isLoading = false;
        this.isVerified = true;
        this.message = response.message || 'Email verifie avec succes. Vous pouvez maintenant vous connecter.';

        void Swal.fire({
          icon: 'success',
          title: 'Email verifie',
          text: this.message,
          confirmButtonText: 'Se connecter',
          confirmButtonColor: '#a46e51',
        }).then(() => {
          void this.router.navigate(['/signin']);
        });
      },
      error: (error: Error) => {
        this.isLoading = false;
        this.message = error.message;

        void Swal.fire({
          icon: 'error',
          title: 'Verification impossible',
          text: error.message,
          confirmButtonText: 'Retour a la connexion',
          confirmButtonColor: '#a46e51',
        }).then(() => {
          void this.router.navigate(['/signin']);
        });
      },
    });
  }
}
