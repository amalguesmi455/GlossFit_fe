import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-signup',
  imports: [FormsModule, RouterLink],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  account = {
    name: '',
    email: '',
    role: 'fashionista',
    password: '',
  };
  message = '';

  signup(): void {
    this.message = `${this.account.name || 'Votre profil'} est pret en mode ${this.account.role}.`;
  }
}
