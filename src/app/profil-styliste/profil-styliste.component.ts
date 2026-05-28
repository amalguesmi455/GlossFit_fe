import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

interface StylisteProfile {
  name: string;
  specialty: string;
  city: string;
  price: string;
  availability: string;
  bio: string;
}

@Component({
  selector: 'app-profil-styliste',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profil-styliste.component.html',
  styleUrl: './profil-styliste.component.css'
})
export class ProfilStylisteComponent {
  profile: StylisteProfile = {
    name: 'Nora Bensalem',
    specialty: 'Capsule wardrobe',
    city: 'Lyon',
    price: '80 EUR / look',
    availability: 'Disponible cette semaine',
    bio: 'Styliste specialisee dans les silhouettes epurees, les couleurs neutres et les pieces durables.',
  };

  draft: StylisteProfile = { ...this.profile };
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
