import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-signin',
  imports: [FormsModule, RouterLink],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent {
  email = '';
  password = '';
  message = '';

  signin(): void {
    this.message = `Connexion prete pour ${this.email || 'votre compte'}.`;
  }
}
