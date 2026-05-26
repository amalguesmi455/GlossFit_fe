import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface FashionistaProfile {
  name: string;
  city: string;
  style: string;
  size: string;
  budget: string;
  bio: string;
}

@Component({
  selector: 'app-profil-fashionista',
  imports: [FormsModule, RouterLink],
  templateUrl: './profil-fashionista.component.html',
  styleUrl: './profil-fashionista.component.css'
})
export class ProfilFashionistaComponent {
  profile: FashionistaProfile = {
    name: 'Maya Diallo',
    city: 'Paris',
    style: 'Minimal chic',
    size: 'M',
    budget: '120 EUR',
    bio: 'Aime les tenues elegantes, confortables et faciles a mixer.',
  };

  draft: FashionistaProfile = { ...this.profile };
  saved = false;

  save(): void {
    this.profile = { ...this.draft };
    this.saved = true;
  }

  reset(): void {
    this.draft = { ...this.profile };
    this.saved = false;
  }
}
