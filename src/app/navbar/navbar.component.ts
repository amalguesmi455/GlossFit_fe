import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [FormsModule, RouterLink],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  authModal: 'signin' | 'signup' | null = null;
  isLoggedIn = false;
  isMobileMenuOpen = false;
  isProfileMenuOpen = false;
  isScrolled = false;
  activeSection = 'hero';
  language: 'fr' | 'en' = 'fr';
  authMessage = '';
  signinForm = {
    email: '',
    password: '',
  };
  signupForm = {
    name: '',
    email: '',
    role: 'fashionista',
    password: '',
  };
  user = {
    name: 'Amal Guesmi',
    avatar: 'AG',
  };

  constructor(private router: Router) {}

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

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeAuthModal();
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

  openAuthModal(mode: 'signin' | 'signup'): void {
    this.authModal = mode;
    this.authMessage = '';
    this.isMobileMenuOpen = false;
    this.isProfileMenuOpen = false;
  }

  closeAuthModal(): void {
    this.authModal = null;
    this.authMessage = '';
  }

  switchAuthModal(mode: 'signin' | 'signup'): void {
    this.authModal = mode;
    this.authMessage = '';
  }

  signin(): void {
    this.isLoggedIn = true;
    this.user = {
      name: this.signinForm.email ? this.signinForm.email.split('@')[0] : 'Amal Guesmi',
      avatar: this.getInitials(this.signinForm.email || 'Amal Guesmi'),
    };
    this.closeAuthModal();
  }

  signup(): void {
    this.isLoggedIn = true;
    this.user = {
      name: this.signupForm.name || 'Nouveau profil',
      avatar: this.getInitials(this.signupForm.name || this.signupForm.email || 'Nouveau profil'),
    };
    this.closeAuthModal();
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
    this.isLoggedIn = false;
    this.isProfileMenuOpen = false;
    this.isMobileMenuOpen = false;
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
