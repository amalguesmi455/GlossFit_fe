import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { AuthService } from '../core/auth/auth.service';
import { AuthUser } from '../core/auth/auth.models';
import { DashboardStats, DashboardStatsService } from '../core/dashboard-stats.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent implements OnInit, OnDestroy {
  services = [
    'Creation de dressing personnel',
    'Brief precis pour styliste',
    'Profil fashionista et profil styliste',
  ];

  isLoggedIn = false;
  currentUser: AuthUser | null = null;
  loadingDashboard = false;
  dashboardError = '';
  dashboardStats: DashboardStats | null = null;
  dashboardCards: DashboardCard[] = [];

  private readonly subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private dashboardStatsService: DashboardStatsService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.authService.currentUser$.subscribe(user => {
        this.currentUser = user;
        this.isLoggedIn = !!user;

        if (!user) {
          this.dashboardStats = null;
          this.dashboardCards = [];
          this.dashboardError = '';
          return;
        }

        this.loadDashboardStats();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get roleLabel(): string {
    switch (this.currentUser?.role) {
      case 'ADMIN':
        return 'Administrateur';
      case 'STYLISTE':
        return 'Styliste';
      case 'FASHIONISTA':
      default:
        return 'Fashionista';
    }
  }

  get dashboardTitle(): string {
    switch (this.currentUser?.role) {
      case 'ADMIN':
        return 'Dashboard Global';
      case 'STYLISTE':
        return 'Dashboard Styliste';
      case 'FASHIONISTA':
      default:
        return 'Dashboard Fashionista';
    }
  }

  get dashboardLead(): string {
    switch (this.currentUser?.role) {
      case 'ADMIN':
        return 'Suis les performances globales, les profils actifs et le flux des demandes en un coup d’œil.';
      case 'STYLISTE':
        return 'Consulte tes propositions, les réactions reçues et l’état de tes demandes en cours.';
      case 'FASHIONISTA':
      default:
        return 'Retrouve tes réactions, tes demandes et les looks refusés pour garder une vue claire sur ton activité.';
    }
  }

  get secondaryActionLabel(): string {
    switch (this.currentUser?.role) {
      case 'ADMIN':
        return 'Gérer les profils';
      case 'STYLISTE':
      case 'FASHIONISTA':
      default:
        return 'Voir les demandes';
    }
  }

  get secondaryActionRoute(): string {
    switch (this.currentUser?.role) {
      case 'ADMIN':
        return '/adminDashbord';
      case 'STYLISTE':
      case 'FASHIONISTA':
      default:
        return '/styling-request';
    }
  }

  refreshDashboard(): void {
    if (this.currentUser) {
      this.loadDashboardStats();
    }
  }

  private loadDashboardStats(): void {
    this.loadingDashboard = true;
    this.dashboardError = '';

    this.subscriptions.add(
      this.dashboardStatsService.getStats().pipe(
        finalize(() => {
          this.loadingDashboard = false;
        })
      ).subscribe({
        next: stats => {
          this.dashboardStats = stats;
          this.dashboardCards = this.buildCards(stats);
        },
        error: () => {
          this.dashboardError = 'Impossible de charger les statistiques du tableau de bord pour le moment.';
          this.dashboardStats = null;
          this.dashboardCards = [];
        },
      })
    );
  }

  private buildCards(stats: DashboardStats): DashboardCard[] {
    switch (stats.role) {
      case 'ADMIN':
        return [
          { label: 'Likes', value: stats.totalLikes, icon: 'fa-solid fa-heart', tone: 'rose' },
          { label: 'Dislikes', value: stats.totalDislikes, icon: 'fa-solid fa-thumbs-down', tone: 'plum' },
          { label: 'Posts', value: stats.totalPosts, icon: 'fa-solid fa-layer-group', tone: 'gold' },
          { label: 'Stylistes', value: stats.stylisteCount, icon: 'fa-solid fa-user-tie', tone: 'ink' },
          { label: 'Fashionistas', value: stats.fashionistaCount, icon: 'fa-solid fa-user-group', tone: 'rose' },
          { label: 'Demandes', value: stats.totalRequests, icon: 'fa-solid fa-envelope-open-text', tone: 'plum' },
          { label: 'Demandes acceptées', value: stats.acceptedRequests, icon: 'fa-solid fa-circle-check', tone: 'gold' },
          { label: 'Demandes non acceptées', value: stats.refusedRequests, icon: 'fa-solid fa-circle-xmark', tone: 'ink' },
          { label: 'Demandes en attente', value: stats.pendingRequests, icon: 'fa-solid fa-clock', tone: 'rose' },
        ];
      case 'STYLISTE':
        return [
          { label: 'Likes reçus', value: stats.stylisteLikesReceived, icon: 'fa-solid fa-heart', tone: 'rose' },
          { label: 'Dislikes reçus', value: stats.stylisteDislikesReceived, icon: 'fa-solid fa-thumbs-down', tone: 'plum' },
          { label: 'Demandes reçues', value: stats.totalRequests, icon: 'fa-solid fa-inbox', tone: 'gold' },
          { label: 'Demandes acceptées', value: stats.acceptedRequests, icon: 'fa-solid fa-circle-check', tone: 'ink' },
          { label: 'Demandes non acceptées', value: stats.refusedRequests, icon: 'fa-solid fa-circle-xmark', tone: 'rose' },
          { label: 'Looks refusés', value: stats.stylisteRefusedLooks, icon: 'fa-solid fa-ban', tone: 'plum' },
        ];
      case 'FASHIONISTA':
      default:
        return [
          { label: 'Likes faits', value: stats.fashionistaLikesMade, icon: 'fa-solid fa-heart', tone: 'rose' },
          { label: 'Dislikes faits', value: stats.fashionistaDislikesMade, icon: 'fa-solid fa-thumbs-down', tone: 'plum' },
          { label: 'Demandes envoyées', value: stats.totalRequests, icon: 'fa-solid fa-paper-plane', tone: 'gold' },
          { label: 'Demandes acceptées', value: stats.acceptedRequests, icon: 'fa-solid fa-circle-check', tone: 'ink' },
          { label: 'Demandes non acceptées', value: stats.refusedRequests, icon: 'fa-solid fa-circle-xmark', tone: 'rose' },
          { label: 'Looks refusés', value: stats.fashionistaRefusedLooks, icon: 'fa-solid fa-ban', tone: 'plum' },
        ];
    }
  }
}

interface DashboardCard {
  label: string;
  value: number;
  icon: string;
  tone: 'rose' | 'plum' | 'gold' | 'ink';
}
