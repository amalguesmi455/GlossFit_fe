import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

import { AuthService } from '../core/auth/auth.service';
import { AuthUser } from '../core/auth/auth.models';

@Component({
  selector: 'app-signin',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent {
  email = '';
  password = '';
  message = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  signin(): void {
    this.message = '';
    this.isLoading = true;

    this.authService.signIn({ email: this.email, password: this.password }).subscribe({
      next: user => {
        this.isLoading = false;
        void Swal.fire({
          icon: 'success',
          title: 'Connexion reussie',
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
          text: error.message,
          confirmButtonText: 'Reessayer',
          confirmButtonColor: '#a46e51',
        });
      },
    });
  }

  private getProfileRoute(user: AuthUser): string {
    return user.role === 'STYLISTE'
      ? `/profilestyliste/${user.id}`
      : `/profilefashionista/${user.id}`;
  }
}
