import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

import { FashionistaProfileService } from '../core/fashionista-profile.service';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-create-profile-fashionista',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-profile-fashionista.component.html',
  styleUrls: ['./create-profile-fashionista.component.css']
})
export class CreateProfileFashionistaComponent implements OnInit {

  currentStep = 1;
  isLoading = false;
  message = '';
  avatarPreview: string | null = null;

  // ================= FORM =================
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

  // ================= OPTIONS =================
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
    private authService: AuthService,  // ✅ use AuthService, not raw localStorage
    private router: Router
  ) {}

  ngOnInit(): void {
    console.log('[INIT] Fashionista profile component loaded');
  }

  // ================= TEMPLATE HELPER =================
  getSkintoneColor(value: string): string {
    return this.skinTones.find(t => t.value === value)?.color || '#000';
  }

  // ================= FILE HANDLING =================
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

  // ================= STEPS =================
  nextStep(): void {
    this.currentStep++;
  }

  prevStep(): void {
    this.currentStep--;
  }

  // ================= SUBMIT =================
  submit(): void {
    // ✅ Read user from AuthService (single source of truth)
    const user = this.authService.currentUser;

    if (!user) {
      this.message = 'Utilisateur non connecté';
      return;
    }

    this.isLoading = true;

    this.profileService.createProfile(this.formData, user.id).subscribe({

      next: () => {
        this.isLoading = false;

        // ✅ KEY FIX: update hasProfile in the local session so routing
        // works correctly on next navigation without needing a new login
        this.authService.updateHasProfile(true);

        void Swal.fire({
          icon: 'success',
          title: 'Profil créé !',
          text: 'Votre profil a été créé avec succès.',
          confirmButtonText: 'Continuer',
          confirmButtonColor: '#a46e51',
        }).then(() => {
          void this.router.navigate([`/profilefashionista/${user.id}`]);
        });
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