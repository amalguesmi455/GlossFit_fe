import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';

import { environment } from '../../environments/environment';
import { AuthService } from '../core/auth/auth.service';
import {
  ClothingItem,
  ClothingItemService,
} from '../core/clothing-item.service';
import { FashionistaProfileService } from '../core/fashionista-profile.service';
import {
  StylingProposal,
  StylingProposalCreatePayload,
  StylingProposalDecisionPayload,
  StylingProposalService,
} from '../core/styling-proposal.service';
import {
  StylisteProfile,
  StylisteProfileService,
} from '../core/styliste-profile.service';
import {
  StylingRequest,
  StylingRequestCreatePayload,
  StylingRequestService,
  StylingRequestUserRef,
} from '../core/styling-request.service';

type RequestTab = 'PENDING' | 'ACCEPTED' | 'REFUSED' | 'DONE';
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

interface StylingProposalForm {
  title: string;
  stylistNote: string;
  clothingItemIds: number[];
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
    { label: 'Terminées', value: 'DONE' },
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
  selectedRequestId: number | null = null;
  selectedRequestMessage = '';
  isRequestModalOpen = false;
  proposalLoading = false;
  wardrobeLoading = false;
  proposalSubmitting = false;
  decisionSubmittingProposalId: number | null = null;
  doneSubmitting = false;
  selectedRequestProposals: StylingProposal[] = [];
  selectedRequestWardrobe: ClothingItem[] = [];
  proposalDecisionReasons: Record<number, string> = {};
  proposalForm: StylingProposalForm = this.createEmptyProposalForm();

  requestForm: StylingRequestForm = this.createEmptyRequestForm();
  private pendingRequestSelectionId: number | null = null;
  private openPendingRequestModal = false;

  constructor(
    private clothingItemService: ClothingItemService,
    private authService: AuthService,
    private stylingProposalService: StylingProposalService,
    private stylingRequestService: StylingRequestService,
    private fashionistaProfileService: FashionistaProfileService,
    private stylisteProfileService: StylisteProfileService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser;

    if (!user) {
      this.message = 'Tu dois être connecté pour consulter les demandes de style.';
      return;
    }

    this.currentUserId = user.id;
    this.viewerRole = this.normalizeRole(user.role);
    this.readPendingRequestSelection();

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
      DONE: this.requests.filter((request) => request.status === 'DONE').length,
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

  private readPendingRequestSelection(): void {
    const requestIdParam = this.route.snapshot.queryParamMap.get('requestId');
    if (!requestIdParam) {
      this.pendingRequestSelectionId = null;
      this.openPendingRequestModal = false;
      return;
    }

    const requestId = Number(requestIdParam);
    if (!Number.isFinite(requestId) || requestId <= 0) {
      this.pendingRequestSelectionId = null;
      this.openPendingRequestModal = false;
      return;
    }

    this.pendingRequestSelectionId = requestId;
    this.openPendingRequestModal = this.route.snapshot.queryParamMap.get('open') !== '0';
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
        this.handleUpdatedRequest(updatedRequest);
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
        this.handleUpdatedRequest(updatedRequest);
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
        this.selectRequest(createdRequest.id);

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

  get selectedRequest(): StylingRequest | null {
    return this.requests.find((request) => request.id === this.selectedRequestId) ?? null;
  }

  get selectedRequestLatestProposal(): StylingProposal | null {
    return this.selectedRequestProposals[0] ?? null;
  }

  get canCreateProposalForSelectedRequest(): boolean {
    if (this.viewerRole !== 'STYLISTE') {
      return false;
    }

    const selectedRequest = this.selectedRequest;
    const latestProposal = this.selectedRequestLatestProposal;

    if (!selectedRequest || selectedRequest.status !== 'ACCEPTED') {
      return false;
    }

    if (!latestProposal) {
      return true;
    }

    return latestProposal.status === 'REFUSED';
  }

  get canMarkSelectedRequestAsDone(): boolean {
    const selectedRequest = this.selectedRequest;
    const latestProposal = this.selectedRequestLatestProposal;

    if (!selectedRequest || this.viewerRole !== 'FASHIONISTA' || selectedRequest.status === 'DONE') {
      return false;
    }

    return latestProposal !== null && (latestProposal.status === 'ACCEPTED' || latestProposal.status === 'REFUSED');
  }

  selectRequest(requestOrId: StylingRequest | number): void {
    const requestId = typeof requestOrId === 'number' ? requestOrId : requestOrId.id;
    this.selectedRequestId = requestId;
    this.selectedRequestMessage = '';
    this.proposalDecisionReasons = {};
    this.proposalForm = this.createEmptyProposalForm();
    this.loadSelectedRequestWorkspace(requestId);
  }

  openRequestModal(request: StylingRequest): void {
    this.selectRequest(request);
    this.isRequestModalOpen = true;
  }

  closeRequestModal(): void {
    this.isRequestModalOpen = false;
  }

  toggleProposalItem(itemId: number): void {
    const index = this.proposalForm.clothingItemIds.indexOf(itemId);
    if (index >= 0) {
      this.proposalForm.clothingItemIds = this.proposalForm.clothingItemIds.filter((id) => id !== itemId);
      return;
    }

    this.proposalForm.clothingItemIds = [...this.proposalForm.clothingItemIds, itemId];
  }

  isProposalItemSelected(itemId: number): boolean {
    return this.proposalForm.clothingItemIds.includes(itemId);
  }

  submitProposal(): void {
    const selectedRequest = this.selectedRequest;

    if (this.viewerRole !== 'STYLISTE' || !selectedRequest || !this.canCreateProposalForSelectedRequest) {
      this.selectedRequestMessage = 'Sélectionne une demande acceptée avant de créer une proposition.';
      return;
    }

    if (!this.proposalForm.title.trim() || !this.proposalForm.stylistNote.trim() || !this.proposalForm.clothingItemIds.length) {
      this.selectedRequestMessage = 'Ajoute un titre, une note et au moins une pièce du dressing.';
      return;
    }

    this.proposalSubmitting = true;
    this.selectedRequestMessage = '';

    const payload: StylingProposalCreatePayload = {
      title: this.proposalForm.title.trim(),
      stylistNote: this.proposalForm.stylistNote.trim(),
      clothingItemIds: [...this.proposalForm.clothingItemIds],
    };

    this.stylingProposalService.createProposal(selectedRequest.id, payload).subscribe({
      next: () => {
        this.proposalSubmitting = false;
        this.proposalForm = this.createEmptyProposalForm();
        this.loadSelectedRequestWorkspace(selectedRequest.id);

        void Swal.fire({
          icon: 'success',
          title: 'Proposition envoyée',
          text: 'La fashionista peut maintenant voir ta tenue.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#a46e51',
        });
      },
      error: (error) => {
        this.proposalSubmitting = false;
        this.selectedRequestMessage = this.getErrorMessage(error, 'Impossible de créer la proposition pour le moment.');
      },
    });
  }

  respondToProposal(proposal: StylingProposal, decision: 'ACCEPTED' | 'REFUSED'): void {
    if (this.viewerRole !== 'FASHIONISTA') {
      return;
    }

    const selectedRequest = this.selectedRequest;
    if (!selectedRequest || proposal.status !== 'PENDING_REVIEW') {
      return;
    }

    const reason = (this.proposalDecisionReasons[proposal.id] ?? '').trim();
    if (decision === 'REFUSED' && !reason) {
      this.selectedRequestMessage = 'Ajoute un petit message pour expliquer ton refus.';
      return;
    }

    this.decisionSubmittingProposalId = proposal.id;
    this.selectedRequestMessage = '';

    const payload: StylingProposalDecisionPayload = {
      decision,
      reason,
    };

    this.stylingProposalService.respondToProposal(proposal.id, payload).subscribe({
      next: () => {
        this.decisionSubmittingProposalId = null;
        this.loadSelectedRequestWorkspace(selectedRequest.id);

        void Swal.fire({
          icon: 'success',
          title: decision === 'ACCEPTED' ? 'Proposition acceptée' : 'Proposition refusée',
          text: 'Le styliste a été notifié de ta décision.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#a46e51',
        });
      },
      error: (error) => {
        this.decisionSubmittingProposalId = null;
        this.selectedRequestMessage = this.getErrorMessage(error, 'Impossible d’envoyer ta décision pour le moment.');
      },
    });
  }

  markSelectedRequestAsDone(): void {
    const selectedRequest = this.selectedRequest;
    if (this.viewerRole !== 'FASHIONISTA' || !selectedRequest || !this.canMarkSelectedRequestAsDone) {
      return;
    }

    this.doneSubmitting = true;
    this.selectedRequestMessage = '';

    this.stylingRequestService.markStylingRequestAsDone(selectedRequest.id).subscribe({
      next: (updatedRequest) => {
        this.doneSubmitting = false;
        this.handleUpdatedRequest(updatedRequest);

        void Swal.fire({
          icon: 'success',
          title: 'Demande clôturée',
          text: 'La demande est maintenant marquée comme terminée.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#a46e51',
        });
      },
      error: (error) => {
        this.doneSubmitting = false;
        this.selectedRequestMessage = this.getErrorMessage(error, 'Impossible de marquer la demande comme terminée pour le moment.');
      },
    });
  }

  statusLabel(status: string): string {
    switch (status) {
      case 'ACCEPTED':
        return 'Acceptée';
      case 'REFUSED':
        return 'Refusée';
      case 'DONE':
        return 'Terminée';
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

  requestActionLabel(): string {
    return this.viewerRole === 'STYLISTE' ? 'Proposer' : 'Voir';
  }

  proposalStatusLabel(status: string): string {
    switch (status) {
      case 'ACCEPTED':
        return 'Acceptée';
      case 'REFUSED':
        return 'Refusée';
      default:
        return 'En attente de réponse';
    }
  }

  proposalStatusTone(status: string): string {
    switch (status) {
      case 'ACCEPTED':
        return 'accepted';
      case 'REFUSED':
        return 'refused';
      default:
        return 'pending';
    }
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
        if (!this.applyPendingRouteSelection()) {
          this.ensureSelectedRequest();
        }
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
        if (!this.applyPendingRouteSelection()) {
          this.ensureSelectedRequest();
        }
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

  private handleUpdatedRequest(updatedRequest: StylingRequest): void {
    this.updateRequestInList(updatedRequest);

    if (this.selectedRequestId === updatedRequest.id) {
      this.loadSelectedRequestWorkspace(updatedRequest.id);
    }
  }

  private ensureSelectedRequest(): void {
    const selectedRequest = this.selectedRequest ?? this.requests[0] ?? null;

    if (!selectedRequest) {
      this.resetWorkspace();
      return;
    }

    this.selectedRequestId = selectedRequest.id;
    this.loadSelectedRequestWorkspace(selectedRequest.id);
  }

  private applyPendingRouteSelection(): boolean {
    if (this.pendingRequestSelectionId === null) {
      return false;
    }

    const selectedRequest = this.requests.find((request) => request.id === this.pendingRequestSelectionId) ?? null;
    if (!selectedRequest) {
      return false;
    }

    this.activeTab = selectedRequest.status as RequestTab;
    this.isRequestModalOpen = this.openPendingRequestModal;
    this.selectRequest(selectedRequest);
    return true;
  }

  private loadSelectedRequestWorkspace(requestId: number): void {
    this.loadProposalsForRequest(requestId);

    if (this.viewerRole === 'STYLISTE') {
      const selectedRequest = this.selectedRequest;
      if (selectedRequest?.status === 'ACCEPTED') {
        this.loadWardrobeForSelectedRequest(selectedRequest);
      } else {
        this.selectedRequestWardrobe = [];
        this.wardrobeLoading = false;
      }
    }
  }

  private loadProposalsForRequest(requestId: number): void {
    this.proposalLoading = true;
    this.selectedRequestMessage = '';

    this.stylingProposalService.getByRequestId(requestId).subscribe({
      next: (proposals) => {
        this.selectedRequestProposals = proposals;
        this.proposalLoading = false;
        this.syncProposalDecisionDrafts();
      },
      error: (error) => {
        this.selectedRequestProposals = [];
        this.proposalLoading = false;
        this.selectedRequestMessage = this.getErrorMessage(error, 'Impossible de charger les propositions pour le moment.');
      },
    });
  }

  private loadWardrobeForSelectedRequest(request: StylingRequest): void {
    const fashionistaUserId = this.getUserId(request.fashionista);

    if (fashionistaUserId === null) {
      this.selectedRequestWardrobe = [];
      this.selectedRequestMessage = 'Impossible d’identifier la fashionista pour accéder au dressing.';
      return;
    }

    this.wardrobeLoading = true;

    this.clothingItemService.getFashionistaWardrobe(fashionistaUserId).subscribe({
      next: (items) => {
        this.selectedRequestWardrobe = items;
        this.wardrobeLoading = false;
      },
      error: (error) => {
        this.selectedRequestWardrobe = [];
        this.wardrobeLoading = false;
        this.selectedRequestMessage = this.getErrorMessage(error, 'Impossible de charger le dressing de la fashionista.');
      },
    });
  }

  private syncProposalDecisionDrafts(): void {
    const draftReasons: Record<number, string> = {};

    for (const proposal of this.selectedRequestProposals) {
      if (proposal.status === 'PENDING_REVIEW') {
        draftReasons[proposal.id] = this.proposalDecisionReasons[proposal.id] ?? '';
      }
    }

    this.proposalDecisionReasons = draftReasons;
  }

  private resetWorkspace(): void {
    this.selectedRequestId = null;
    this.selectedRequestMessage = '';
    this.selectedRequestProposals = [];
    this.selectedRequestWardrobe = [];
    this.proposalDecisionReasons = {};
    this.proposalForm = this.createEmptyProposalForm();
    this.proposalLoading = false;
    this.wardrobeLoading = false;
  }

  private getUserId(ref?: StylingRequestUserRef): number | null {
    return ref?.userId ?? ref?.user?.id ?? null;
  }

  resolveImageUrl(imagePath: string | null | undefined): string {
    if (!imagePath) {
      return '';
    }

    const trimmedPath = imagePath.trim();

    if (/^(https?:)?\/\//.test(trimmedPath) || trimmedPath.startsWith('data:')) {
      return trimmedPath;
    }

    const baseUrl = environment.apiUrl.replace(/\/api$/, '');

    if (trimmedPath.includes('/')) {
      return `${baseUrl}/${trimmedPath.replace(/^\/+/, '')}`;
    }

    return `${baseUrl}/uploads/profiles/${encodeURIComponent(trimmedPath)}`;
  }

  private createEmptyProposalForm(): StylingProposalForm {
    return {
      title: '',
      stylistNote: '',
      clothingItemIds: [],
    };
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
