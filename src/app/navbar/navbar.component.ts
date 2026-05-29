import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

import { AuthService } from '../core/auth/auth.service';
import { AuthUser, UserRole } from '../core/auth/auth.models';

@Component({
  selector: 'app-navbar',
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent implements OnInit {
  isLoggedIn = false;
  isMobileMenuOpen = false;
  isProfileMenuOpen = false;
  isScrolled = false;
  activeSection = 'hero';
  language: 'fr' | 'en' = 'fr';
  user = {
    name: 'Amal Guesmi',
    avatar: 'AG',
    role: 'FASHIONISTA' as UserRole,
    id: 0,
  };

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => this.applyAuthUser(user));
  }

  @HostListener('window:scroll')
  onWindowScroll(): void {
    this.isScrolled = window.scrollY > 24;
    this.updateActiveSection();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;

    if (!target.closest('.profile-menu-wrapper')) {
      this.isProfileMenuOpen = false;
    }
  }

  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    this.isProfileMenuOpen = false;
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  toggleLanguage(): void {
    this.language = this.language === 'fr' ? 'en' : 'fr';
  }

  goToSection(sectionId: string): void {
    this.closeMobileMenu();

    void this.router.navigate(['/']).then(() => {
      setTimeout(() => {
        const section = document.getElementById(sectionId);

        if (!section) {
          return;
        }

        const navbarOffset = 86;
        const targetTop = section.getBoundingClientRect().top + window.scrollY - navbarOffset;
        window.scrollTo({ top: targetTop, behavior: 'smooth' });
        this.activeSection = sectionId;
      }, 80);
    });
  }

  private updateActiveSection(): void {
    const sectionIds = ['features', 'about', 'pricing', 'contact'];
    let current = '';

    for (const id of sectionIds) {
      const section = document.getElementById(id);

      if (section && section.getBoundingClientRect().top <= 140) {
        current = id;
      }
    }

    this.activeSection = current || 'hero';
  }

  logout(): void {
    this.authService.logout();
    this.isProfileMenuOpen = false;
    this.isMobileMenuOpen = false;
    void this.router.navigate(['/']);
  }

  get isCreateProfilePage(): boolean {
    return this.router.url.startsWith("/createprofilefashionista") ||
           this.router.url.startsWith("/createprofilestyliste");
  }

  get profileRoute(): string {
    if (this.user.role === 'ADMIN') {
      return '/adminDashbord';
    }

    return this.user.role === 'STYLISTE'
      ? `/profilestyliste/${this.user.id}`
      : `/profilefashionista/${this.user.id}`;
  }

  get settingsRoute(): string {
    return this.profileRoute;
  }

  get displayRole(): string {
    const labels: Record<UserRole, string> = {
      ADMIN: 'Admin',
      FASHIONISTA: 'Fashionista',
      STYLISTE: 'Styliste',
    };

    return labels[this.user.role] ?? 'Utilisateur';
  }

  get isAdmin(): boolean {
    return this.user.role === 'ADMIN';
  }

  get isFashionista(): boolean {
    return this.user.role === 'FASHIONISTA';
  }

  private applyAuthUser(authUser: AuthUser | null): void {
    this.isLoggedIn = !!authUser;

    if (!authUser) {
      return;
    }

    this.user = {
      name: authUser.email.split('@')[0] || 'GlossFit',
      avatar: this.getInitials(authUser.email),
      role: this.normalizeRole(authUser.role),
      id: authUser.id,
    };
  }

  private normalizeRole(role: string): UserRole {
    const normalized = String(role || '').replace(/^ROLE_/, '').toUpperCase();

    if (normalized === 'ADMIN' || normalized === 'STYLISTE') {
      return normalized;
    }

    return 'FASHIONISTA';
  }

  private getInitials(value: string): string {
    return value
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(part => part[0]?.toUpperCase())
      .join('') || 'GF';
  }
}
