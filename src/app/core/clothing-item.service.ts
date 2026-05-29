import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';

export interface ClothingItem {
  id: number;
  image: string;
  description: string;
  category: string;
  brand: string;
  style: string;
  size: string;
  occasion: string;
  season: string;
  material: string;
  subCategory: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ClothingItemFormData {
  description: string;
  category: string;
  brand: string;
  style: string;
  size: string;
  occasion: string;
  season: string;
  material: string;
  subCategory: string;
  image: File | null;
}

@Injectable({
  providedIn: 'root',
})
export class ClothingItemService {
  private readonly apiUrl = `${environment.apiUrl}/wardrobe`;

  constructor(private http: HttpClient) {}

  createClothingItem(item: ClothingItemFormData): Observable<ClothingItem> {
    return this.http.post<ClothingItem>(this.apiUrl, this.toFormData(item));
  }

  getWardrobe(): Observable<ClothingItem[]> {
    return this.http.get<ClothingItem[]>(this.apiUrl);
  }

  getFashionistaWardrobe(fashionistaUserId: number): Observable<ClothingItem[]> {
    return this.http.get<ClothingItem[]>(`${environment.apiUrl}/wardrobe-access/fashionista/${fashionistaUserId}`);
  }

  getClothingItem(itemId: number): Observable<ClothingItem> {
    return this.http.get<ClothingItem>(`${this.apiUrl}/${itemId}`);
  }

  updateClothingItem(itemId: number, item: Partial<ClothingItemFormData>): Observable<ClothingItem> {
    return this.http.put<ClothingItem>(`${this.apiUrl}/${itemId}`, this.toFormData(item));
  }

  deleteClothingItem(itemId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${itemId}`);
  }

  private toFormData(item: Partial<ClothingItemFormData>): FormData {
    const formData = new FormData();

    this.appendIfDefined(formData, 'description', item.description);
    this.appendIfDefined(formData, 'category', item.category);
    this.appendIfDefined(formData, 'brand', item.brand);
    this.appendIfDefined(formData, 'style', item.style);
    this.appendIfDefined(formData, 'size', item.size);
    this.appendIfDefined(formData, 'occasion', item.occasion);
    this.appendIfDefined(formData, 'season', item.season);
    this.appendIfDefined(formData, 'material', item.material);
    this.appendIfDefined(formData, 'subCategory', item.subCategory);

    if (item.image) {
      formData.append('image', item.image);
    }

    return formData;
  }

  private appendIfDefined(formData: FormData, key: string, value?: string | null): void {
    if (value !== undefined && value !== null) {
      formData.append(key, value);
    }
  }
}
