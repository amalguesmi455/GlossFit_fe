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
  items: DressingItem[] = [
    { id: 1, name: 'Blazer structure', category: 'Veste', color: 'Noir', season: 'Toutes saisons' },
    { id: 2, name: 'Jean droit', category: 'Bas', color: 'Denim brut', season: 'Automne' },
    { id: 3, name: 'Chemise fluide', category: 'Haut', color: 'Ivoire', season: 'Printemps' },
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
}
