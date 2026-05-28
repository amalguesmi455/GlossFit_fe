import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';

import { AuthService } from '../core/auth/auth.service';
import {
  ClothingItem,
  ClothingItemFormData,
  ClothingItemService,
} from '../core/clothing-item.service';
import { environment } from '../../environments/environment';

type Option = {
  label: string;
  value: string;
};

@Component({
  selector: 'app-dressing',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './dressing.component.html',
  styleUrl: './dressing.component.css',
})
export class DressingComponent implements OnInit {
  @ViewChild('imageInput') imageInput?: ElementRef<HTMLInputElement>;

  readonly categoryOptions: Option[] = [
    { label: 'Toutes', value: 'ALL' },
    { label: 'Tops', value: 'TOPS' },
    { label: 'Bas', value: 'BOTTOMS' },
    { label: 'Robes', value: 'DRESSES' },
    { label: 'Vestes', value: 'OUTERWEAR' },
    { label: 'Accessoires', value: 'ACCESSORIES' },
    { label: 'Chaussures', value: 'SHOES' },
  ];

  readonly styleOptions: Option[] = [
    { label: 'Casual', value: 'CASUAL' },
    { label: 'Chic', value: 'CHIC' },
    { label: 'Élégant', value: 'ELEGANT' },
    { label: 'Minimaliste', value: 'MINIMALIST' },
    { label: 'Streetwear', value: 'STREETWEAR' },
    { label: 'Vintage', value: 'VINTAGE' },
    { label: 'Bohème', value: 'BOHEMIAN' },
    { label: 'Sportif', value: 'SPORTY' },
    { label: 'Formel', value: 'FORMAL' },
    { label: 'Business casual', value: 'BUSINESS_CASUAL' },
    { label: 'Glamour', value: 'GLAMOROUS' },
    { label: 'Romantique', value: 'ROMANTIC' },
    { label: 'Classique', value: 'CLASSIC' },
    { label: 'Moderne', value: 'MODERN' },
    { label: 'Oversize', value: 'OVERSIZED' },
    { label: 'Y2K', value: 'Y2K' },
    { label: 'Preppy', value: 'PREPPY' },
    { label: 'Audacieux', value: 'EDGY' },
    { label: 'Luxe', value: 'LUXURY' },
    { label: 'Style coréen', value: 'KOREAN_STYLE' },
  ];

  readonly sizeOptions: Option[] = [
    { label: 'XS', value: 'XS' },
    { label: 'S', value: 'S' },
    { label: 'M', value: 'M' },
    { label: 'L', value: 'L' },
    { label: 'XL', value: 'XL' },
    { label: 'XXL', value: 'XXL' },
    { label: 'Taille unique', value: 'ONESIZE' },
  ];

  readonly occasionOptions: Option[] = [
    { label: 'Casual', value: 'CASUAL' },
    { label: 'Formel', value: 'FORMAL' },
    { label: 'Soirée', value: 'PARTY' },
    { label: 'Travail', value: 'WORK' },
    { label: 'Date', value: 'DATING' },
    { label: 'Mariage', value: 'WEDDING' },
    { label: 'Anniversaire', value: 'BIRTHDAY' },
  ];

  readonly seasonOptions: Option[] = [
    { label: 'Printemps', value: 'SPRING' },
    { label: 'Été', value: 'SUMMER' },
    { label: 'Automne', value: 'FALL' },
    { label: 'Hiver', value: 'WINTER' },
    { label: 'Toutes saisons', value: 'ALL_SEASON' },
  ];

  readonly materialOptions: Option[] = [
    { label: 'Coton', value: 'COTTON' },
    { label: 'Lin', value: 'LINEN' },
    { label: 'Laine', value: 'WOOL' },
    { label: 'Polyester', value: 'POLYESTER' },
    { label: 'Soie', value: 'SILK' },
    { label: 'Satin', value: 'SATIN' },
    { label: 'Mousseline', value: 'CHIFFON' },
    { label: 'Denim', value: 'DENIM' },
    { label: 'Cuir', value: 'LEATHER' },
    { label: 'Velours', value: 'VELVET' },
    { label: 'Maille', value: 'KNIT' },
    { label: 'Cachemire', value: 'CASHMERE' },
    { label: 'Jersey', value: 'JERSEY' },
    { label: 'Tweed', value: 'TWEED' },
    { label: 'Dentelle', value: 'LACE' },
    { label: 'Rayonne', value: 'RAYON' },
    { label: 'Viscose', value: 'VISCOSE' },
    { label: 'Nylon', value: 'NYLON' },
    { label: 'Polaire', value: 'FLEECE' },
    { label: 'Organza', value: 'ORGANZA' },
  ];

  readonly subCategoryOptions: Option[] = [
    { label: 'Blazer', value: 'BLAZER' },
    { label: 'Robe maxi', value: 'MAXI_DRESS' },
    { label: 'Mini robe', value: 'MINI_DRESS' },
    { label: 'Robe midi', value: 'MIDI_DRESS' },
    { label: 'Hoodie', value: 'HOODIE' },
    { label: 'Pull', value: 'SWEATER' },
    { label: 'Cardigan', value: 'CARDIGAN' },
    { label: 'Gilet', value: 'VEST' },
    { label: 'Veste', value: 'JACKET' },
    { label: 'Manteau', value: 'COAT' },
    { label: 'Trench coat', value: 'TRENCH_COAT' },
    { label: 'T-shirt', value: 'T_SHIRT' },
    { label: 'Crop top', value: 'CROP_TOP' },
    { label: 'Débardeur', value: 'TANK_TOP' },
    { label: 'Chemise', value: 'SHIRT' },
    { label: 'Jean', value: 'JEANS' },
    { label: 'Jupe', value: 'SKIRT' },
    { label: 'Jupe plissée', value: 'PLEATED_SKIRT' },
    { label: 'Short', value: 'SHORTS' },
    { label: 'Combinaison', value: 'JUMPSUIT' },
    { label: 'Survêtement', value: 'TRACKSUIT' },
    { label: 'Costume', value: 'SUIT' },
    { label: 'Pull-over', value: 'PULLOVER' },
    { label: 'Polo', value: 'POLO_SHIRT' },
    { label: 'Bomber', value: 'BOMBER_JACKET' },
    { label: 'Doudoune', value: 'PUFFER_JACKET' },
    { label: 'Pantalon de jogging', value: 'SWEATPANTS' },
    { label: 'Legging', value: 'LEGGINGS' },
    { label: 'Abaya', value: 'ABAYA' },
    { label: 'Kimono', value: 'KIMONO' },
    { label: 'Tunique', value: 'TUNIC' },
    { label: 'Top corset', value: 'CORSET_TOP' },
  ];

  activeCategory = 'ALL';
  searchTerm = '';
  isLoading = false;
  message = '';
  editingItemId: number | null = null;
  imagePreview: string | null = null;

  items: ClothingItem[] = [];

  formData: ClothingItemFormData = this.createEmptyFormData();

  private readonly categoryIcons: Record<string, string> = {
    TOPS: 'fa-shirt',
    BOTTOMS: 'fa-person',
    DRESSES: 'fa-person-dress',
    OUTERWEAR: 'fa-vest',
    ACCESSORIES: 'fa-glasses',
    SHOES: 'fa-shoe-prints',
  };

  private readonly categorySwatches: Record<string, string> = {
    TOPS: '#d8b99a',
    BOTTOMS: '#243b64',
    DRESSES: '#a46e51',
    OUTERWEAR: '#4a4a4a',
    ACCESSORIES: '#e3b6ae',
    SHOES: '#1f1717',
  };

  constructor(
    private clothingItemService: ClothingItemService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    if (this.authService.currentUser?.role && this.authService.currentUser.role !== 'FASHIONISTA') {
      this.message = 'Le dressing personnel est réservé aux fashionistas.';
      return;
    }

    this.loadWardrobe();
  }

  loadWardrobe(): void {
    this.isLoading = true;
    this.message = '';

    this.clothingItemService.getWardrobe().subscribe({
      next: (items) => {
        this.items = items;
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this.message = this.getErrorMessage(error, 'Impossible de charger le dressing.');
      },
    });
  }

  submitItem(): void {
    if (!this.isFormValid()) {
      this.message = 'Merci de compléter tous les champs du dressing.';
      return;
    }

    this.isLoading = true;
    this.message = '';

    const itemId = this.editingItemId;
    const isCreating = itemId === null;
    const request = isCreating
      ? this.clothingItemService.createClothingItem(this.formData)
      : this.clothingItemService.updateClothingItem(itemId, this.formData);

    request.subscribe({
      next: (savedItem) => {
        this.isLoading = false;

        if (isCreating) {
          this.items = [savedItem, ...this.items];
        } else {
          this.items = this.items.map((item) => (item.id === savedItem.id ? savedItem : item));
        }

        this.resetForm();

        void Swal.fire({
          icon: 'success',
          title: isCreating ? 'Pièce ajoutée' : 'Pièce mise à jour',
          text: isCreating
            ? 'La pièce a été ajoutée au dressing.'
            : 'La pièce a été mise à jour avec succès.',
          confirmButtonText: 'Continuer',
          confirmButtonColor: '#a46e51',
        });
      },
      error: (error) => {
        this.isLoading = false;
        this.message = this.getErrorMessage(error, 'Erreur lors de la sauvegarde de la pièce.');

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

  editItem(item: ClothingItem): void {
    this.editingItemId = item.id;
    this.formData = {
      description: item.description,
      category: item.category,
      brand: item.brand,
      style: item.style,
      size: item.size,
      occasion: item.occasion,
      season: item.season,
      material: item.material,
      subCategory: item.subCategory,
      image: null,
    };
    this.imagePreview = this.imageSrc(item.image);
    this.message = '';

    if (this.imageInput) {
      this.imageInput.nativeElement.value = '';
    }
  }

  cancelEdit(): void {
    this.resetForm();
    this.message = '';
  }

  deleteItem(itemId: number): void {
    void Swal.fire({
      icon: 'warning',
      title: 'Supprimer cette pièce ?',
      text: 'Cette action est définitive.',
      showCancelButton: true,
      confirmButtonText: 'Supprimer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#a46e51',
      cancelButtonColor: '#c8b2a9',
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      this.clothingItemService.deleteClothingItem(itemId).subscribe({
        next: () => {
          this.items = this.items.filter((item) => item.id !== itemId);

          void Swal.fire({
            icon: 'success',
            title: 'Pièce supprimée',
            text: 'La pièce a été retirée du dressing.',
            confirmButtonText: 'OK',
            confirmButtonColor: '#a46e51',
          });
        },
        error: (error) => {
          this.message = this.getErrorMessage(error, 'Impossible de supprimer cette pièce.');

          void Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: this.message,
            confirmButtonText: 'OK',
            confirmButtonColor: '#a46e51',
          });
        },
      });
    });
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.formData.image = file;

    if (!file) {
      this.imagePreview = null;
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      this.imagePreview = readerEvent.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  get filteredItems(): ClothingItem[] {
    const query = this.searchTerm.trim().toLowerCase();

    return this.items.filter((item) => {
      const matchesCategory = this.activeCategory === 'ALL' || item.category === this.activeCategory;
      const searchable = [
        item.description,
        this.categoryLabel(item.category),
        item.brand,
        this.styleLabel(item.style),
        this.sizeLabel(item.size),
        this.occasionLabel(item.occasion),
        this.seasonLabel(item.season),
        this.materialLabel(item.material),
        this.subCategoryLabel(item.subCategory),
      ]
        .join(' ')
        .toLowerCase();

      return matchesCategory && (!query || searchable.includes(query));
    });
  }

  get heroItems(): ClothingItem[] {
    return this.items.slice(0, 6);
  }

  get outfitScore(): string {
    return this.items.length >= 4 ? '96%' : `${Math.min(this.items.length * 24, 72)}%`;
  }

  selectCategory(category: string): void {
    this.activeCategory = category;
  }

  categoryIcon(category: string): string {
    return this.categoryIcons[category] ?? 'fa-shirt';
  }

  categorySwatch(category: string): string {
    return this.categorySwatches[category] ?? '#a46e51';
  }

  imageSrc(image: string | null | undefined): string {
    if (!image) {
      return '';
    }

    if (/^(https?:)?\/\//.test(image) || image.startsWith('data:') || image.startsWith('/')) {
      return image;
    }

    return `${environment.apiUrl.replace(/\/api$/, '')}/uploads/profiles/${encodeURIComponent(image)}`;
  }

  categoryLabel(category: string): string {
    return this.labelFor(this.categoryOptions, category);
  }

  styleLabel(style: string): string {
    return this.labelFor(this.styleOptions, style);
  }

  sizeLabel(size: string): string {
    return this.labelFor(this.sizeOptions, size);
  }

  occasionLabel(occasion: string): string {
    return this.labelFor(this.occasionOptions, occasion);
  }

  seasonLabel(season: string): string {
    return this.labelFor(this.seasonOptions, season);
  }

  materialLabel(material: string): string {
    return this.labelFor(this.materialOptions, material);
  }

  subCategoryLabel(subCategory: string): string {
    return this.labelFor(this.subCategoryOptions, subCategory);
  }

  private createEmptyFormData(): ClothingItemFormData {
    return {
      description: '',
      category: 'TOPS',
      brand: '',
      style: 'CASUAL',
      size: 'M',
      occasion: 'CASUAL',
      season: 'ALL_SEASON',
      material: 'COTTON',
      subCategory: 'BLAZER',
      image: null,
    };
  }

  private resetForm(): void {
    this.formData = this.createEmptyFormData();
    this.editingItemId = null;
    this.imagePreview = null;

    if (this.imageInput) {
      this.imageInput.nativeElement.value = '';
    }
  }

  private isFormValid(): boolean {
    const requiredFields: Array<keyof Omit<ClothingItemFormData, 'image'>> = [
      'description',
      'category',
      'brand',
      'style',
      'size',
      'occasion',
      'season',
      'material',
      'subCategory',
    ];

    return requiredFields.every((field) => this.formData[field].trim().length > 0);
  }

  private labelFor(options: Option[], value: string): string {
    return options.find((option) => option.value === value)?.label ?? value;
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
