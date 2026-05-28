import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

import { AuthService } from '../core/auth/auth.service';
import { RegisterRole } from '../core/auth/auth.models';

@Component({
  selector: 'app-signup',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  account = {
    name: '',
    email: '',
    role: 'FASHIONISTA' as RegisterRole,
    password: '',
  };
  message = '';
  isLoading = false;

  constructor(private authService: AuthService) {}

  signup(): void {
    this.message = '';

    if (!this.isRegisterFormValid()) {
      this.message = 'Tous les champs sont obligatoires.';
      void Swal.fire({
        icon: 'warning',
        title: 'Champs obligatoires',
        text: this.message,
        confirmButtonText: 'Completer',
        confirmButtonColor: '#a46e51',
      });
      return;
    }

    this.isLoading = true;

    this.authService.register({
      email: this.account.email,
      password: this.account.password,
      role: this.account.role,
    }).subscribe({
      next: response => {
        this.isLoading = false;
        this.message = response.message || 'Compte cree. Verifiez votre email avant de vous connecter.';
        this.account.password = '';
        void Swal.fire({
          icon: 'success',
          title: 'Compte cree',
          text: this.message,
          confirmButtonText: 'Compris',
          confirmButtonColor: '#a46e51',
        });
      },
      error: (error: Error) => {
        this.isLoading = false;
        this.message = error.message;
        void Swal.fire({
          icon: 'error',
          title: 'Inscription impossible',
          text: error.message,
          confirmButtonText: 'Reessayer',
          confirmButtonColor: '#a46e51',
        });
      },
    });
  }

  private isRegisterFormValid(): boolean {
    return !!(
      this.account.name.trim() &&
      this.account.email.trim() &&
      this.account.password.trim() &&
      this.account.role
    );
  }

  setRole(role: RegisterRole): void {
    this.account.role = role;
  }
}