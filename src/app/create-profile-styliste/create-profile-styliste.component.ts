import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StylisteProfileService } from '../core/styliste-profile.service';

@Component({
  selector: 'app-create-profile-styliste',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './create-profile-styliste.component.html',
  styleUrls: ['./create-profile-styliste.component.css']
})
export class CreateProfileStylisteComponent implements OnInit {
  currentStep = 1;
  isLoading = false;
  message = '';
  avatarPreview: string | null = null;

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
    { label: 'Événementiel', value: 'evenementiel', icon: 'fa-solid fa-champagne-glasses' }
  ];

  styleOptions = [
    { label: 'Classique', value: 'classique', icon: 'fa-solid fa-vest' },
    { label: 'Casual', value: 'casual', icon: 'fa-solid fa-shirt' },
    { label: 'Bohème', value: 'boheme', icon: 'fa-solid fa-leaf' },
    { label: 'Sportif', value: 'sportif', icon: 'fa-solid fa-dumbbell' },
    { label: 'Tendance', value: 'tendance', icon: 'fa-solid fa-star' },
    { label: 'Chic', value: 'chic', icon: 'fa-solid fa-crown' }
  ];

  userId: number | null = null;

  constructor(private profileService: StylisteProfileService) {
    // TODO: Remplacer par récupération de l'ID utilisateur depuis AuthService
    // Pour maintenant, utiliser une valeur par défaut ou depuis localStorage
    const storedUserId = localStorage.getItem('userId');
    this.userId = storedUserId ? parseInt(storedUserId, 10) : 1; // Default to 1 for testing
  }

  ngOnInit() {
    console.log('[v0] StylisteComponent initialized, formData:', this.formData);
    console.log('[v0] Current userId:', this.userId);
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
    // Validation pour step 1
    if (this.currentStep === 1) {
      if (!this.formData.nom || !this.formData.prenom) {
        this.message = 'Erreur: Veuillez remplir tous les champs obligatoires';
        console.log('[v0] Step 1 validation failed - missing required fields');
        return;
      }
    }

    // Validation pour step 2
    if (this.currentStep === 2) {
      if (!this.formData.stylistSpecialty || !this.formData.style) {
        this.message = 'Erreur: Veuillez remplir tous les champs obligatoires';
        console.log('[v0] Step 2 validation failed');
        return;
      }
    }

    this.currentStep++;
    this.message = '';
    console.log('[v0] Moving to step:', this.currentStep);
  }

  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.message = '';
      console.log('[v0] Moving back to step:', this.currentStep);
    }
  }

  submit() {
    console.log('[v0] Submit called with formData:', this.formData);

    // Validation finale
    if (!this.formData.nom || !this.formData.prenom) {
      this.message = 'Erreur: Veuillez remplir tous les champs obligatoires';
      console.log('[v0] Final validation failed - missing nom or prenom');
      return;
    }

    if (!this.formData.stylistSpecialty || !this.formData.style) {
      this.message = 'Erreur: Veuillez sélectionner votre spécialité et style';
      console.log('[v0] Final validation failed - missing specialty or style');
      return;
    }

    if (!this.formData.portfolio) {
      this.message = 'Erreur: Veuillez ajouter un lien portfolio/Instagram';
      console.log('[v0] Final validation failed - missing portfolio');
      return;
    }

    if (!this.userId) {
      this.message = 'Erreur: Impossible de récupérer votre ID utilisateur';
      console.log('[v0] Cannot submit - userId is missing');
      return;
    }

    this.isLoading = true;
    console.log('[v0] Submitting profile with userId:', this.userId);

    this.profileService.createProfile(this.formData, this.userId).subscribe({
      next: (response: any) => {
        console.log('[v0] Profile created successfully:', response);
        this.isLoading = false;
        this.message = 'Profil créé avec succès!';
        // Redirection après succès
        setTimeout(() => {
          // TODO: Ajouter navigation vers dashboard
        }, 2000);
      },
      error: (error: any) => {
        console.log('[v0] Error creating profile:', error);
        this.isLoading = false;
        this.message = 'Erreur: ' + (error?.error?.message || 'Impossible de créer le profil');
      }
    });
  }
}
