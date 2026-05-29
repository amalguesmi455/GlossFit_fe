import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { AuthService } from '../core/auth/auth.service';
import { FashionistaProfileService } from '../core/fashionista-profile.service';
import {
  StylisteProfile,
  StylisteProfileService,
} from '../core/styliste-profile.service';
import {
  StylingRequest,
  StylingRequestCreatePayload,
  StylingRequestService,
} from '../core/styling-request.service';

type RequestTab = 'PENDING' | 'ACCEPTED' | 'REFUSED';
type ViewerRole = 'FASHIONISTA' | 'STYLISTE' | 'ADMIN';

type Suggestion = {
  label: string;
  value: string;
};

interface StylingRequestForm {
  fashionistaId: number | null;
  stylisteId: number | null;
  eventType: string;
  dressCode: string;
  place: string;
  eventDateTime: string;
  season: string;
  weather: string;
  theme: string;
  formalityLevel: string;
  description: string;
}

@Component({
  selector: 'app-styling-request',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './styling-request.component.html',
  styleUrl: './styling-request.component.css',
})
export class StylingRequestComponent implements OnInit {
  readonly tabs: Array<{ label: string; value: RequestTab }> = [
    { label: 'En attente', value: 'PENDING' },
    { label: 'Acceptées', value: 'ACCEPTED' },
    { label: 'Refusées', value: 'REFUSED' },
  ];

  readonly eventTypeOptions: Suggestion[] = [
    { label: 'Mariage', value: 'WEDDING' },
    { label: 'Soirée', value: 'PARTY' },
    { label: 'Entretien', value: 'INTERVIEW' },
    { label: 'Rendez-vous', value: 'DATE' },
    { label: 'Sortie casual', value: 'CASUAL_OUTING' },
    { label: 'Réunion business', value: 'BUSINESS_MEETING' },
    { label: 'Dîner', value: 'DINNER' },
    { label: 'Anniversaire', value: 'BIRTHDAY' },
    { label: 'Voyage', value: 'TRAVEL' },
    { label: 'Évènement spécial', value: 'SPECIAL_EVENT' },
  ];

  readonly dressCodeOptions: Suggestion[] = [
    { label: 'Black tie', value: 'BLACK_TIE' },
    { label: 'Formal', value: 'FORMAL' },
    { label: 'Business casual', value: 'BUSINESS_CASUAL' },
    { label: 'Smart casual', value: 'SMART_CASUAL' },
    { label: 'Casual chic', value: 'CASUAL_CHIC' },
    { label: 'Tenue de soirée', value: 'EVENING_WEAR' },
    { label: 'Tenue confortable', value: 'COMFORTABLE' },
    { label: 'Streetwear', value: 'STREETWEAR' },
    { label: 'Romantique', value: 'ROMANTIC' },
    { label: 'Élégant', value: 'ELEGANT' },
  ];

  readonly placeOptions: Suggestion[] = [
    { label: 'Open space', value: 'OPEN_SPACE' },
    { label: 'Bureau', value: 'OFFICE' },
    { label: 'Restaurant', value: 'RESTAURANT' },
    { label: 'Hôtel', value: 'HOTEL' },
    { label: 'Jardin', value: 'GARDEN' },
    { label: 'Plage', value: 'BEACH' },
    { label: 'Extérieur', value: 'OUTDOOR' },
    { label: 'Intérieur', value: 'INDOOR' },
    { label: 'Salle de réception', value: 'RECEPTION_HALL' },
    { label: 'Ville / rue', value: 'CITY' },
  ];

  readonly weatherOptions: Suggestion[] = [
    { label: 'Ensoleillé', value: 'SUNNY' },
    { label: 'Nuageux', value: 'CLOUDY' },
    { label: 'Pluvieux', value: 'RAINY' },
    { label: 'Venteux', value: 'WINDY' },
    { label: 'Froid', value: 'COLD' },
    { label: 'Chaud', value: 'HOT' },
    { label: 'Doux', value: 'MILD' },
  ];

  readonly seasonOptions: Suggestion[] = [
    { label: 'Printemps', value: 'SPRING' },
    { label: 'Été', value: 'SUMMER' },
    { label: 'Automne', value: 'FALL' },
    { label: 'Hiver', value: 'WINTER' },
  ];

  readonly themeOptions: Suggestion[] = [
    { label: 'Élégant', value: 'ELEGANT' },
    { label: 'Romantique', value: 'ROMANTIC' },
    { label: 'Minimaliste', value: 'MINIMALIST' },
    { label: 'Moderne', value: 'MODERN' },
    { label: 'Luxe', value: 'LUXURY' },
    { label: 'Bohème', value: 'BOHEMIAN' },
    { label: 'Glamour', value: 'GLAMOROUS' },
    { label: 'Professionnel', value: 'PROFESSIONAL' },
    { label: 'Festif', value: 'FESTIVE' },
    { label: 'Créatif', value: 'CREATIVE' },
  ];

  readonly formalityOptions: Suggestion[] = [
    { label: 'Very casual', value: 'VERY_CASUAL' },
    { label: 'Casual', value: 'CASUAL' },
    { label: 'Business casual', value: 'BUSINESS_CASUAL' },
    { label: 'Formal', value: 'FORMAL' },
    { label: 'Black tie', value: 'BLACK_TIE' },
  ];

  readonly descriptionSuggestions: string[] = [
    'Je veux une tenue élégante, confortable et adaptée à l’occasion.',
    'Je préfère un look moderne, sobre et facile à porter toute la journée.',
    'Je cherche une proposition chic avec une touche tendance.',
    'Je veux éviter les coupes trop serrées et privilégier le confort.',
    'Je souhaite une tenue qui mette en valeur ma morphologie et ma taille.',
  ];

  isLoading = false;
  isSubmitting = false;
  message = '';
  activeTab: RequestTab = 'PENDING';
  requests: StylingRequest[] = [];
  stylists: StylisteProfile[] = [];
  viewerRole: ViewerRole | null = null;
  profileId: number | null = null;
  currentUserId: number | null = null;
  profileHint = '';

  requestForm: StylingRequestForm = this.createEmptyRequestForm();

  constructor(
    private authService: AuthService,
    private stylingRequestService: StylingRequestService,
    private fashionistaProfileService: FashionistaProfileService,
    private stylisteProfileService: StylisteProfileService
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser;

    if (!user) {
      this.message = 'Tu dois être connecté pour consulter les demandes de style.';
      return;
    }

    this.currentUserId = user.id;
    this.viewerRole = this.normalizeRole(user.role);

    if (this.viewerRole === 'ADMIN') {
      this.message = 'Cette page est réservée aux fashionistas et aux stylistes.';
      return;
    }

    if (this.viewerRole === 'FASHIONISTA') {
      this.loadStylists();
      this.loadFashionistaContext(user.id);
      return;
    }

    this.loadStylisteContext(user.id);
  }

  get filteredRequests(): StylingRequest[] {
    return this.requests.filter((request) => request.status === this.activeTab);
  }

  get statusCounts(): Record<RequestTab, number> {
    return {
      PENDING: this.requests.filter((request) => request.status === 'PENDING').length,
      ACCEPTED: this.requests.filter((request) => request.status === 'ACCEPTED').length,
      REFUSED: this.requests.filter((request) => request.status === 'REFUSED').length,
    };
  }

  get title(): string {
    return this.viewerRole === 'STYLISTE' ? 'Demandes reçues' : 'Mes demandes de style';
  }

  get subtitle(): string {
    return this.viewerRole === 'STYLISTE'
      ? 'Consulte les briefs envoyés par les fashionistas et suis leur statut.'
      : 'Retrouve toutes tes demandes envoyées et crée un nouveau brief quand tu en as besoin.';
  }

  get showCreateForm(): boolean {
    return this.viewerRole === 'FASHIONISTA';
  }

  get canSubmitRequest(): boolean {
    return this.showCreateForm && this.profileId !== null && !this.isSubmitting && this.stylists.length > 0;
  }

  refresh(): void {
    if (this.viewerRole === 'FASHIONISTA' && this.profileId !== null) {
      this.loadFashionistaRequests(this.profileId);
      return;
    }

    if (this.viewerRole === 'STYLISTE' && this.profileId !== null) {
      this.loadStylisteRequests(this.profileId);
    }
  }

  applyDescriptionSuggestion(value: string): void {
    this.requestForm.description = value;
  }

  chooseStylist(stylist: StylisteProfile): void {
    this.requestForm.stylisteId = stylist.id ?? null;
  }

  acceptRequest(requestId: number): void {
    if (this.viewerRole !== 'STYLISTE' || this.profileId === null) {
      return;
    }

    this.stylingRequestService.acceptStylingRequest(requestId).subscribe({
      next: (updatedRequest) => {
        this.updateRequestInList(updatedRequest);
        void Swal.fire({
          icon: 'success',
          title: 'Demande acceptée',
          text: 'La fashionista a été notifiée.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#a46e51',
        });
      },
      error: (error) => {
        this.message = this.getErrorMessage(error, 'Impossible d’accepter la demande pour le moment.');
      },
    });
  }

  refuseRequest(requestId: number): void {
    if (this.viewerRole !== 'STYLISTE' || this.profileId === null) {
      return;
    }

    this.stylingRequestService.refuseStylingRequest(requestId).subscribe({
      next: (updatedRequest) => {
        this.updateRequestInList(updatedRequest);
        void Swal.fire({
          icon: 'success',
          title: 'Demande refusée',
          text: 'La fashionista a été notifiée.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#a46e51',
        });
      },
      error: (error) => {
        this.message = this.getErrorMessage(error, 'Impossible de refuser la demande pour le moment.');
      },
    });
  }

  submitRequest(): void {
    if (!this.canSubmitRequest || this.profileId === null) {
      this.message = 'Crée ton profil fashionista avant d’envoyer une demande.';
      return;
    }

    if (!this.isRequestValid()) {
      this.message = 'Merci de compléter les champs obligatoires avant l’envoi.';
      return;
    }

    this.isSubmitting = true;
    this.message = '';

    const payload: StylingRequestCreatePayload = {
      fashionistaId: this.profileId,
      stylisteId: this.requestForm.stylisteId as number,
      eventType: this.requestForm.eventType,
      dressCode: this.requestForm.dressCode,
      place: this.requestForm.place,
      eventDateTime: this.requestForm.eventDateTime,
      season: this.requestForm.season,
      weather: this.requestForm.weather,
      theme: this.requestForm.theme,
      formalityLevel: this.requestForm.formalityLevel,
      description: this.requestForm.description,
    };

    this.stylingRequestService.createStylingRequest(payload).subscribe({
      next: (createdRequest) => {
        this.isSubmitting = false;
        this.requests = [createdRequest, ...this.requests];
        this.activeTab = 'PENDING';
        this.requestForm = this.createEmptyRequestForm();
        this.requestForm.fashionistaId = this.profileId;

        void Swal.fire({
          icon: 'success',
          title: 'Demande envoyée',
          text: 'Ton brief a été envoyé au styliste sélectionné.',
          confirmButtonText: 'Continuer',
          confirmButtonColor: '#a46e51',
        });
      },
      error: (error) => {
        this.isSubmitting = false;
        this.message = this.getErrorMessage(error, 'Impossible d’envoyer la demande pour le moment.');

        void Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: this.message,
          confirmButtonText: 'Réessayer',
          confirmButtonColor: '#a46e51',
        });
      },
    });
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'ACCEPTED':
        return 'Acceptée';
      case 'REFUSED':
        return 'Refusée';
      default:
        return 'En attente';
    }
  }

  requestCounterpart(request: StylingRequest): string {
    if (this.viewerRole === 'STYLISTE') {
      return this.displayName(request.fashionista);
    }

    return this.displayName(request.styliste);
  }

  requestFashionistaDetails(request: StylingRequest): string {
    const taille = request.fashionista?.taille;
    const morphologie = request.fashionista?.morphologie;
    const parts = [
      taille ? `Taille ${taille}` : '',
      morphologie ? `Morphologie ${morphologie}` : '',
    ].filter(Boolean);

    return parts.join(' · ') || 'Profil fashionista';
  }

  requestStylistMeta(request: StylingRequest): string {
    const style = request.styliste?.style;
    const ville = request.styliste?.ville;
    const parts = [style ? `Style ${style}` : '', ville ? ville : ''].filter(Boolean);
    return parts.join(' · ') || 'Styliste';
  }

  private loadFashionistaContext(userId: number): void {
    this.isLoading = true;
    this.message = '';

    this.fashionistaProfileService.getProfile(userId).subscribe({
      next: (profile) => {
        const profileId = profile.id ?? null;

        if (profileId === null) {
          this.isLoading = false;
          return;
        }

        this.profileId = profileId;
        this.requestForm.fashionistaId = profileId;

        this.loadFashionistaRequests(profileId);
      },
      error: () => {
        this.isLoading = false;
        this.requests = [];
        this.message = 'Crée ton profil fashionista pour consulter et envoyer tes demandes.';
      },
    });
  }

  private loadStylisteContext(userId: number): void {
    this.isLoading = true;
    this.message = '';

    this.stylisteProfileService.getProfile(userId).subscribe({
      next: (profile) => {
        const profileId = profile.id ?? null;

        if (profileId === null) {
          this.isLoading = false;
          this.message = 'Ton profil styliste n’est pas encore disponible.';
          return;
        }

        this.profileId = profileId;
        this.loadStylisteRequests(profileId);
      },
      error: () => {
        this.isLoading = false;
        this.requests = [];
        this.message = 'Crée ton profil styliste pour voir les demandes reçues.';
      },
    });
  }

  private loadFashionistaRequests(profileId: number): void {
    this.stylingRequestService.getByFashionista(profileId).subscribe({
      next: (requests) => {
        this.requests = requests;
        this.isLoading = false;
        this.ensureVisibleTab();
      },
      error: () => {
        this.isLoading = false;
        this.message = 'Impossible de charger tes demandes pour le moment.';
      },
    });
  }

  private loadStylisteRequests(profileId: number): void {
    this.stylingRequestService.getByStyliste(profileId).subscribe({
      next: (requests) => {
        this.requests = requests;
        this.isLoading = false;
        this.ensureVisibleTab();
      },
      error: () => {
        this.isLoading = false;
        this.message = 'Impossible de charger les demandes reçues pour le moment.';
      },
    });
  }

  private loadStylists(): void {
    this.stylisteProfileService.getAllProfiles().subscribe({
      next: (response) => {
        const rawStylists = Array.isArray(response) ? response : response ? [response] : [];

        this.stylists = rawStylists
          .map((profile: any, index) => ({
            ...profile,
            id: profile.id ?? profile.user?.id ?? index + 1,
            nom: profile.nom ?? '',
            prenom: profile.prenom ?? '',
            ville: profile.ville ?? '',
            style: profile.style ?? '',
          }))
          .filter((profile) => profile.id !== null && profile.id !== undefined);

        if (this.stylists.length && this.requestForm.stylisteId === null) {
          this.requestForm.stylisteId = this.stylists[0].id ?? null;
        }
      },
      error: () => {
        this.message = 'Impossible de charger la liste des stylistes pour le moment.';
      },
    });
  }

  private ensureVisibleTab(): void {
    if (this.requests.some((request) => request.status === this.activeTab)) {
      return;
    }

    const firstTab = this.tabs.find((tab) => this.requests.some((request) => request.status === tab.value));
    this.activeTab = firstTab?.value || 'PENDING';
  }

  private updateRequestInList(updatedRequest: StylingRequest): void {
    this.requests = this.requests.map((request) =>
      request.id === updatedRequest.id ? updatedRequest : request
    );

    this.ensureVisibleTab();
  }

  private isRequestValid(): boolean {
    return Boolean(
      this.requestForm.stylisteId !== null &&
      this.requestForm.stylisteId !== undefined &&
      this.requestForm.eventType.trim() &&
      this.requestForm.dressCode.trim() &&
      this.requestForm.place.trim() &&
      this.requestForm.eventDateTime.trim() &&
      this.requestForm.season.trim() &&
      this.requestForm.weather.trim() &&
      this.requestForm.theme.trim() &&
      this.requestForm.formalityLevel.trim() &&
      this.requestForm.description.trim()
    );
  }

  private createEmptyRequestForm(): StylingRequestForm {
    return {
      fashionistaId: null,
      stylisteId: null,
      eventType: 'WEDDING',
      dressCode: 'ELEGANT',
      place: 'OPEN_SPACE',
      eventDateTime: '',
      season: 'SUMMER',
      weather: 'SUNNY',
      theme: 'ELEGANT',
      formalityLevel: 'FORMAL',
      description: '',
    };
  }

  private normalizeRole(role: ViewerRole | string): ViewerRole {
    const normalized = role.toUpperCase();

    if (normalized === 'STYLISTE' || normalized === 'ADMIN') {
      return normalized;
    }

    return 'FASHIONISTA';
  }

  private displayName(profile: { email?: string; nom?: string; prenom?: string } | undefined): string {
    if (!profile) {
      return 'Profil inconnu';
    }

    if (profile.nom || profile.prenom) {
      return `${profile.prenom ?? ''} ${profile.nom ?? ''}`.trim();
    }

    return profile.email ?? 'Profil inconnu';
  }

  private getErrorMessage(error: unknown, fallback: string): string {
    if (error && typeof error === 'object' && 'error' in error) {
      const response = error as { error?: { message?: string } | string; message?: string };
      if (typeof response.error === 'string') {
        return response.error;
      }
      if (response.error?.message) {
        return response.error.message;
      }
      if (response.message) {
        return response.message;
      }
    }

    if (error instanceof Error && error.message) {
      return error.message;
    }

    return fallback;
  }
}
