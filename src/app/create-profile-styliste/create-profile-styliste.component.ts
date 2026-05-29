import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import Swal from 'sweetalert2';
import { StylisteProfileService } from '../core/styliste-profile.service';
import { AuthService } from '../core/auth/auth.service';

@Component({
  selector: 'app-create-profile-styliste',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './create-profile-styliste.component.html',
  styleUrls: ['./create-profile-styliste.component.css']
})
export class CreateProfileStylisteComponent implements OnInit {
  currentStep = 1;
  isLoading = false;
  message = '';
  avatarPreview: string | null = null;
  userId: number = 0;

  formData = {
    nom: '',
    prenom: '',
    ville: '',
    experienceYears: 0,
    stylistSpecialty: '',
    style: '',
    portfolio: '',
    profilePicture: null as File | null
  };

  specialties = [
    { label: 'Conseil personnel', value: 'conseil-personnel', icon: 'fa-solid fa-person-hiking' },
    { label: 'Relooking', value: 'relooking', icon: 'fa-solid fa-wand-magic-sparkles' },
    { label: 'Couleurs & contrastes', value: 'couleurs', icon: 'fa-solid fa-palette' },
    { label: 'Shopping', value: 'shopping', icon: 'fa-solid fa-bag-shopping' },
    { label: 'Garde-robe', value: 'garde-robe', icon: 'fa-solid fa-closet' },
    { label: 'Evenementiel', value: 'evenementiel', icon: 'fa-solid fa-champagne-glasses' }
  ];

  styleOptions = [
    { label: 'Classique', value: 'classique', icon: 'fa-solid fa-vest' },
    { label: 'Casual', value: 'casual', icon: 'fa-solid fa-shirt' },
    { label: 'Boheme', value: 'boheme', icon: 'fa-solid fa-leaf' },
    { label: 'Sportif', value: 'sportif', icon: 'fa-solid fa-dumbbell' },
    { label: 'Tendance', value: 'tendance', icon: 'fa-solid fa-star' },
    { label: 'Chic', value: 'chic', icon: 'fa-solid fa-crown' }
  ];

  constructor(
    private profileService: StylisteProfileService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    const user = this.authService.currentUser;
    if (!user) {
      this.router.navigate(['/signin']);
      return;
    }
    this.userId = user.id;
    console.log('[v0] StylisteComponent initialized, userId:', this.userId);
  }

  onFileSelected(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.formData.profilePicture = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.avatarPreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  nextStep() {
    if (this.currentStep === 1) {
      if (!this.formData.nom || !this.formData.prenom) {
        this.message = 'Erreur: Veuillez remplir tous les champs obligatoires';
        return;
      }
    }
    if (this.currentStep === 2) {
      if (!this.formData.stylistSpecialty || !this.formData.style) {
        this.message = 'Erreur: Veuillez remplir tous les champs obligatoires';
        return;
      }
    }
    this.currentStep++;
    this.message = '';
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.message = '';
    }
  }

  submit() {
    if (!this.formData.nom || !this.formData.prenom) {
      this.message = 'Erreur: Veuillez remplir tous les champs obligatoires';
      return;
    }
    if (!this.formData.stylistSpecialty || !this.formData.style) {
      this.message = 'Erreur: Veuillez selectionner votre specialite et style';
      return;
    }
    if (!this.formData.portfolio) {
      this.message = 'Erreur: Veuillez ajouter un lien portfolio/Instagram';
      return;
    }
    if (!this.userId) {
      this.message = 'Erreur: Impossible de recuperer votre ID utilisateur';
      return;
    }

    this.isLoading = true;

    this.profileService.createProfile(this.formData, this.userId).subscribe({
      next: (response: any) => {
        console.log('[v0] Profile created successfully:', response);
        this.isLoading = false;
        this.authService.updateHasProfile(true);
        // Navigate to feed with a state flag — the feed will read it and fire the Swal
        this.router.navigate(['/feed'], { state: { profileCreated: true } });
      },
      error: (error: any) => {
        console.log('[v0] Error creating profile:', error);
        this.isLoading = false;
        this.message = 'Erreur: ' + (error?.error?.message || 'Impossible de creer le profil');
      }
    });
  }
}