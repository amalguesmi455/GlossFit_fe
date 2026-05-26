import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface DressingItem {
  id: number;
  name: string;
  category: string;
  color: string;
  season: string;
}

@Component({
  selector: 'app-dressing',
  imports: [FormsModule],
  templateUrl: './dressing.component.html',
  styleUrl: './dressing.component.css'
})
export class DressingComponent {
  readonly categories = ['Tous', 'Haut', 'Bas', 'Robe', 'Veste', 'Chaussures', 'Accessoire'];

  activeCategory = 'Tous';
  searchTerm = '';

  items: DressingItem[] = [
    { id: 1, name: 'Blazer structure', category: 'Veste', color: 'Noir', season: 'Toutes saisons' },
    { id: 2, name: 'Jean droit', category: 'Bas', color: 'Denim brut', season: 'Automne' },
    { id: 3, name: 'Chemise fluide', category: 'Haut', color: 'Ivoire', season: 'Printemps' },
    { id: 4, name: 'Robe portefeuille', category: 'Robe', color: 'Rouge', season: 'Ete' },
  ];

  newItem: Omit<DressingItem, 'id'> = {
    name: '',
    category: 'Haut',
    color: '',
    season: 'Toutes saisons',
  };

  addItem(): void {
    if (!this.newItem.name.trim()) {
      return;
    }

    this.items = [
      { id: Date.now(), ...this.newItem },
      ...this.items,
    ];
    this.newItem = { name: '', category: 'Haut', color: '', season: 'Toutes saisons' };
  }

  deleteItem(id: number): void {
    this.items = this.items.filter((item) => item.id !== id);
  }

  get filteredItems(): DressingItem[] {
    const query = this.searchTerm.trim().toLowerCase();

    return this.items.filter((item) => {
      const matchesCategory = this.activeCategory === 'Tous' || item.category === this.activeCategory;
      const searchable = `${item.name} ${item.category} ${item.color} ${item.season}`.toLowerCase();

      return matchesCategory && (!query || searchable.includes(query));
    });
  }

  get heroItems(): DressingItem[] {
    return this.items.slice(0, 6);
  }

  get outfitScore(): string {
    return this.items.length >= 4 ? '96%' : `${Math.min(this.items.length * 24, 72)}%`;
  }

  selectCategory(category: string): void {
    this.activeCategory = category;
  }

  categoryIcon(category: string): string {
    const icons: Record<string, string> = {
      Haut: 'fa-shirt',
      Bas: 'fa-person',
      Robe: 'fa-person-dress',
      Veste: 'fa-vest',
      Chaussures: 'fa-shoe-prints',
      Accessoire: 'fa-glasses',
    };

    return icons[category] ?? 'fa-shirt';
  }

  colorStyle(color: string): string {
    const normalizedColor = color.trim().toLowerCase();
    const colors: Record<string, string> = {
      beige: '#d8b99a',
      blanc: '#EAD8D3',
      denim: '#243b64',
      'denim brut': '#243b64',
      ivoire: '#EAD8D3',
      noir: '#1f1717',
      rose: '#E3B6AE',
      rouge: '#A46E51',
    };

    return colors[normalizedColor] ?? '#A46E51';
  }
}
