import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, HostListener, OnInit, OnDestroy } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Observable, Subscription } from 'rxjs';

import { AuthService } from '../core/auth/auth.service';
import { AuthUser, UserRole } from '../core/auth/auth.models';
import { FashionistaProfileService } from '../core/fashionista-profile.service';
import { StylisteProfileService } from '../core/styliste-profile.service';
import { NotificationService } from '../core/notification.service';
import { Notification } from '../core/Notification.models';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit, OnDestroy {

  isLoggedIn = false;
  isMobileMenuOpen   = false;
  isProfileMenuOpen  = false;
  isNotifMenuOpen    = false;
  isScrolled         = false;
  activeSection      = 'hero';
  language: 'fr' | 'en' = 'fr';

  user = {
    name:   'Amal Guesmi',
    avatar: 'AG',
    avatarUrl: null as string | null,
    role:   'FASHIONISTA' as UserRole,
    id:     0,
  };

  notifications: Notification[] = [];
  unreadCount = 0;
  profileAvatarUrl: string | null = null;

  private subs = new Subscription();
  private profileAvatarBlobUrl: string | null = null;
  private avatarRequestSeq = 0;

  constructor(
    private router: Router,
    private authService: AuthService,
    private http: HttpClient,
    private fashionistaProfileService: FashionistaProfileService,
    private stylisteProfileService: StylisteProfileService,
    private notifService: NotificationService,
  ) {}

  // ── Lifecycle ────────────────────────────────────────────────────────────

  ngOnInit(): void {
    this.subs.add(
      this.authService.currentUser$.subscribe(user => {
        this.applyAuthUser(user);

        if (user && user.role !== 'ADMIN') {
          this.notifService.startPolling();
        } else {
          this.notifService.stopPolling();
          this.notifications = [];
          this.unreadCount = 0;
        }
      })
    );

    this.subs.add(
      this.notifService.notifications$.subscribe(n => (this.notifications = n))
    );

    this.subs.add(
      this.notifService.unreadCount$.subscribe(c => (this.unreadCount = c))
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    this.revokeProfileAvatar();
  }

  // ── Host listeners ───────────────────────────────────────────────────────

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 24;
    this.updateActiveSection();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.profile-menu-wrapper'))  this.isProfileMenuOpen = false;
    if (!target.closest('.notif-menu-wrapper'))    this.isNotifMenuOpen   = false;
  }

  // ── Menu toggles ─────────────────────────────────────────────────────────

  toggleMobileMenu(): void {
    this.isMobileMenuOpen  = !this.isMobileMenuOpen;
    this.isProfileMenuOpen = false;
    this.isNotifMenuOpen   = false;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    this.isNotifMenuOpen   = false;
  }

  toggleNotifMenu(): void {
    if (this.user.role === 'ADMIN') {
      this.isNotifMenuOpen = false;
      return;
    }

    this.isNotifMenuOpen   = !this.isNotifMenuOpen;
    this.isProfileMenuOpen = false;

    // Refresh list when opening
    if (this.isNotifMenuOpen) {
      this.notifService.fetchAll();
    }
  }

  toggleLanguage(): void {
    this.language = this.language === 'fr' ? 'en' : 'fr';
  }

  // ── Notification actions ─────────────────────────────────────────────────

  onMarkAsRead(notif: Notification, event: MouseEvent): void {
    event.stopPropagation();
    if (this.user.role === 'ADMIN') return;
    if (notif.isRead) return;
    this.notifService.markAsRead(notif.id).subscribe();
  }

  onNotificationClick(notif: Notification, event: MouseEvent): void {
    event.stopPropagation();
    if (this.user.role === 'ADMIN') return;
    this.isNotifMenuOpen = false;

    const openTarget = () => {
      const requestId = notif.stylingRequest?.id;
      void this.router.navigate(['/styling-request'], {
        queryParams: requestId ? { requestId, open: 1 } : {},
      });
    };

    if (notif.isRead) {
      openTarget();
      return;
    }

    this.notifService.markAsRead(notif.id).subscribe({
      next: () => openTarget(),
      error: () => openTarget(),
    });
  }

  onMarkAllAsRead(): void {
    if (this.user.role === 'ADMIN') return;
    this.notifService.markAllAsRead().subscribe();
  }

  notifIcon(type: Notification['type']): string {
    const map: Record<Notification['type'], string> = {
      REQUEST_CREATED:       'fa-solid fa-plus-circle',
      REQUEST_ACCEPTED:      'fa-solid fa-circle-check',
      REQUEST_REFUSED:       'fa-solid fa-circle-xmark',
      NEW_REQUEST_AVAILABLE: 'fa-solid fa-bell',
    };
    return map[type] ?? 'fa-solid fa-bell';
  }

  timeAgo(iso: string): string {
    const diffMs  = Date.now() - new Date(iso).getTime();
    const diffMin = Math.floor(diffMs / 60_000);
    if (diffMin < 1)   return 'À l\'instant';
    if (diffMin < 60)  return `Il y a ${diffMin} min`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24)    return `Il y a ${diffH} h`;
    const diffD = Math.floor(diffH / 24);
    return `Il y a ${diffD} j`;
  }

  // ── Navigation ───────────────────────────────────────────────────────────

  goToSection(sectionId: string): void {
    this.closeMobileMenu();
    void this.router.navigate(['/']).then(() => {
      setTimeout(() => {
        const section = document.getElementById(sectionId);
        if (!section) return;
        const top = section.getBoundingClientRect().top + window.scrollY - 86;
        window.scrollTo({ top, behavior: 'smooth' });
        this.activeSection = sectionId;
      }, 80);
    });
  }

  private updateActiveSection(): void {
    const ids = ['features', 'about', 'pricing', 'contact'];
    let current = '';
    for (const id of ids) {
      const s = document.getElementById(id);
      if (s && s.getBoundingClientRect().top <= 140) current = id;
    }
    this.activeSection = current || 'hero';
  }

  logout(): void {
    this.notifService.stopPolling();
    this.authService.logout();
    this.isProfileMenuOpen = false;
    this.isMobileMenuOpen  = false;
    void this.router.navigate(['/']);
  }

  // ── Getters ──────────────────────────────────────────────────────────────

  get isCreateProfilePage(): boolean {
    return this.router.url.startsWith('/createprofilefashionista') ||
           this.router.url.startsWith('/createprofilestyliste');
  }

  get profileRoute(): string {
    if (this.user.role === 'ADMIN') return '/adminDashbord';
    return this.user.role === 'STYLISTE'
      ? `/profilestyliste/${this.user.id}`
      : `/profilefashionista/${this.user.id}`;
  }

  get profileMenuLabel(): string {
    return this.user.role === 'ADMIN' ? 'Gèrer les profils' : 'Mon profil';
  }

  get settingsRoute(): string {
    return '/settings';
  }

  get displayRole(): string {
    const labels: Record<UserRole, string> = {
      ADMIN:       'Admin',
      FASHIONISTA: 'Fashionista',
      STYLISTE:    'Styliste',
    };
    return labels[this.user.role] ?? 'Utilisateur';
  }

  get isAdmin(): boolean      { return this.user.role === 'ADMIN'; }
  get isFashionista(): boolean { return this.user.role === 'FASHIONISTA'; }

  // ── Private helpers ───────────────────────────────────────────────────────

  private applyAuthUser(authUser: AuthUser | null): void {
    this.revokeProfileAvatar();
    this.isLoggedIn = !!authUser;
    if (!authUser) {
      this.user = {
        name: 'Amal Guesmi',
        avatar: 'AG',
        avatarUrl: null,
        role: 'FASHIONISTA',
        id: 0,
      };
      return;
    }
    this.user = {
      name:   authUser.email.split('@')[0] || 'GlossFit',
      avatar: this.getInitials(authUser.email),
      avatarUrl: null,
      role:   this.normalizeRole(authUser.role),
      id:     authUser.id,
    };

    if (authUser.role === 'ADMIN') {
      this.notifications = [];
      this.unreadCount = 0;
    }

    this.loadProfileAvatar(authUser);
  }

  private normalizeRole(role: string): UserRole {
    const n = String(role || '').replace(/^ROLE_/, '').toUpperCase();
    if (n === 'ADMIN' || n === 'STYLISTE') return n as UserRole;
    return 'FASHIONISTA';
  }

  private getInitials(value: string): string {
    return value
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(p => p[0]?.toUpperCase())
      .join('') || 'GF';
  }

  private loadProfileAvatar(authUser: AuthUser): void {
    if (authUser.role === 'ADMIN') {
      this.profileAvatarUrl = null;
      return;
    }

    const requestSeq = ++this.avatarRequestSeq;
    const source$: Observable<unknown> = authUser.role === 'STYLISTE'
      ? this.stylisteProfileService.getProfile(authUser.id)
      : this.fashionistaProfileService.getProfile(authUser.id);

    source$.subscribe({
      next: (profile: unknown) => {
        if (requestSeq !== this.avatarRequestSeq) return;

        const raw = profile as unknown as Record<string, unknown>;
        const picture =
          raw['profilePictureUrl']      ??
          raw['profilePictureFileName'] ??
          raw['profilePicture']         ??
          raw['pictureUrl']             ??
          raw['imageUrl']               ??
          raw['photoUrl']               ??
          raw['profileImageUrl']        ??
          raw['profile_image_url']      ??
          raw['avatarUrl']              ??
          null;

        if (!picture || typeof picture !== 'string') {
          this.profileAvatarUrl = null;
          return;
        }

        const imageUrl = this.resolveProfileImageUrl(picture);
        this.http.get(imageUrl, { responseType: 'blob' }).subscribe({
          next: (blob) => {
            if (requestSeq !== this.avatarRequestSeq) return;
            this.revokeProfileAvatar();
            this.profileAvatarBlobUrl = URL.createObjectURL(blob);
            this.profileAvatarUrl = this.profileAvatarBlobUrl;
          },
          error: () => {
            if (requestSeq === this.avatarRequestSeq) {
              this.profileAvatarUrl = null;
            }
          },
        });
      },
      error: () => {
        if (requestSeq === this.avatarRequestSeq) {
          this.profileAvatarUrl = null;
        }
      },
    });
  }

  private resolveProfileImageUrl(imagePath: string): string {
    const trimmed = imagePath.trim();
    const baseUrl = environment.apiUrl.replace(/\/api$/, '');

    if (/^(https?:)?\/\//.test(trimmed) || trimmed.startsWith('data:')) {
      return trimmed;
    }

    if (trimmed.startsWith('/')) {
      return `${baseUrl}${trimmed}`;
    }

    if (trimmed.includes('/')) {
      return `${baseUrl}/${trimmed.replace(/^\/+/, '')}`;
    }

    return `${baseUrl}/uploads/profiles/${encodeURIComponent(trimmed)}`;
  }

  private revokeProfileAvatar(): void {
    if (this.profileAvatarBlobUrl) {
      URL.revokeObjectURL(this.profileAvatarBlobUrl);
      this.profileAvatarBlobUrl = null;
    }
    this.profileAvatarUrl = null;
  }
}
