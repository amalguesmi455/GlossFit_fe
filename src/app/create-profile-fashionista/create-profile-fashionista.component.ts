import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';

import { FashionistaProfileService } from '../core/fashionista-profile.service';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-create-profile-fashionista',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-profile-fashionista.component.html',
  styleUrls: ['./create-profile-fashionista.component.css']
})
export class CreateProfileFashionistaComponent implements OnInit {

  currentStep = 1;
  isLoading = false;
  message = '';
  avatarPreview: string | null = null;

  formData = {
    nom: '',
    prenom: '',
    ville: '',
    taille: '',
    poids: null as number | null,
    skinTone: '',
    morphologie: '',
    style: '',
    profilePicture: null as File | null
  };

  tailles = [
    { label: 'Petite', value: 'petite' },
    { label: 'Moyenne', value: 'moyenne' },
    { label: 'Grande', value: 'grande' }
  ];

  skinTones = [
    { label: 'Clair', value: 'clair', icon: 'fa-solid fa-circle', color: '#fdbcb4' },
    { label: 'Moyen', value: 'moyen', icon: 'fa-solid fa-circle', color: '#c19a6b' },
    { label: 'Foncé', value: 'fonce', icon: 'fa-solid fa-circle', color: '#4a4a4a' }
  ];

  morphologies = [
    { label: 'Sablier', value: 'sablier', icon: 'fa-solid fa-hourglass-end' },
    { label: 'Poire', value: 'poire', icon: 'fa-solid fa-apple-whole' },
    { label: 'Rectangle', value: 'rectangle', icon: 'fa-solid fa-square' }
  ];

  styleOptions = [
    { label: 'Classique', value: 'classique', icon: 'fa-solid fa-shirt' },
    { label: 'Casual', value: 'casual', icon: 'fa-solid fa-tshirt' },
    { label: 'Chic', value: 'chic', icon: 'fa-solid fa-crown' }
  ];

  constructor(
    private profileService: FashionistaProfileService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser;
    if (!user) {
      this.router.navigate(['/signin']);
    }
  }

  getSkintoneColor(value: string): string {
    return this.skinTones.find(t => t.value === value)?.color || '#000';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (file) {
      this.formData.profilePicture = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  nextStep(): void {
    this.currentStep++;
  }

  prevStep(): void {
    this.currentStep--;
  }

  submit(): void {
    const user = this.authService.currentUser;
    if (!user) {
      this.message = 'Utilisateur non connecté';
      return;
    }

    this.isLoading = true;

    this.profileService.createProfile(this.formData, user.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.authService.updateHasProfile(true);
        // Navigate first, then Swal fires in the destination component
        void this.router.navigate(
          [`/profilefashionista/${user.id}`],
          { state: { profileCreated: true } }
        );
      },
      error: (err: any) => {
        this.isLoading = false;
        this.message = err?.error?.message || 'Erreur lors de la création du profil';
        console.error('[ERROR]', err);

        void Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: this.message,
          confirmButtonText: 'Réessayer',
          confirmButtonColor: '#a46e51',
        });
      }
    });
  }
}