import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { forkJoin, Subscription } from 'rxjs';
import Swal from 'sweetalert2';

import { AuthService } from '../core/auth/auth.service';
import { AuthUser } from '../core/auth/auth.models';
import {
  CreateStylistPostRequest,
  PostReaction,
  StylistPost,
} from '../core/stylist-post.models';
import { StylistPostSoapService } from '../core/stylist-post-soap.service';
import { environment } from '../../environments/environment';

type SortMode = 'recent' | 'old' | 'likes' | 'dislikes';
type ReactionFilter = 'all' | 'liked' | 'disliked';

interface PostDraft {
  title: string;
  style: string;
  description: string;
  tags: string[];
  tagInput: string;
  imageFile: File | null;
  imagePreview: string | null;
}

@Component({
  selector: 'app-feed',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './feed.component.html',
  styleUrl: './feed.component.css',
})
export class FeedComponent implements OnInit, OnDestroy {
  user: AuthUser | null = null;
  loading = true;
  savingPost = false;
  showCreateModal = false;

  allPosts: StylistPost[] = [];
  likedPostIds = new Set<number>();
  dislikedPostIds = new Set<number>();
  reactingPostIds = new Set<number>();

  filters = {
    sortBy: 'recent' as SortMode,
    style: 'all',
    tag: 'all',
    stylistName: '',
    reaction: 'all' as ReactionFilter,
  };

  draft: PostDraft = this.emptyDraft();

  readonly postStyles = [
    'Classique',
    'Casual',
    'Boheme',
    'Sportif',
    'Tendance',
    'Chic',
  ];

  private subscriptions = new Subscription();

  constructor(
    private authService: AuthService,
    private postService: StylistPostSoapService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const user = this.authService.currentUser;

    if (!user) {
      void this.router.navigate(['/signin']);
      return;
    }

    this.user = user;
    this.loadPosts();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.revokePreview();
  }

  get isStyliste(): boolean {
    return this.user?.role === 'STYLISTE';
  }

  get isFashionista(): boolean {
    return this.user?.role === 'FASHIONISTA';
  }

  get scopedPosts(): StylistPost[] {
    if (!this.user) {
      return [];
    }

    if (this.isStyliste) {
      return this.allPosts.filter(post => post.stylisteUserId === this.user?.id);
    }

    return this.allPosts;
  }

  get visiblePosts(): StylistPost[] {
    let posts = [...this.scopedPosts];

    if (this.isFashionista) {
      if (this.filters.reaction === 'liked') {
        posts = posts.filter(post => this.likedPostIds.has(post.postId));
      } else if (this.filters.reaction === 'disliked') {
        posts = posts.filter(post => this.dislikedPostIds.has(post.postId));
      }

      if (this.filters.stylistName) {
        posts = posts.filter(post => this.normalizeText(post.stylisteName) === this.normalizeText(this.filters.stylistName));
      }
    }

    if (this.filters.style !== 'all') {
      posts = posts.filter(post => this.normalizeText(post.style) === this.normalizeText(this.filters.style));
    }

    if (this.filters.tag !== 'all') {
      posts = posts.filter(post =>
        post.tags.some(tag => this.normalizeText(tag) === this.normalizeText(this.filters.tag))
      );
    }

    return this.sortPosts(posts);
  }

  get availableStyles(): string[] {
    return this.uniqueValues(this.scopedPosts.map(post => post.style));
  }

  get availableTags(): string[] {
    return this.uniqueValues(this.scopedPosts.flatMap(post => post.tags));
  }

  get availableStylisteNames(): string[] {
    return this.uniqueValues(this.allPosts.map(post => post.stylisteName));
  }

  get pageTitle(): string {
    return this.isStyliste ? 'Mes posts' : 'Feed des stylistes';
  }

  get pageSubtitle(): string {
    return this.isStyliste
      ? 'Crée et pilote tes publications depuis un seul espace.'
      : 'Explore les posts, aime ceux qui te parlent et filtre ce qui t interesse.';
  }

  openCreateModal(): void {
    this.showCreateModal = true;
  }

  closeCreateModal(): void {
    this.showCreateModal = false;
    this.resetDraft();
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;

    this.draft.imageFile = file;
    this.revokePreview();

    if (file) {
      this.draft.imagePreview = URL.createObjectURL(file);
    }
  }

  addTagFromDraft(): void {
    const raw = this.draft.tagInput.trim();

    if (!raw) {
      return;
    }

    raw
      .split(',')
      .map(tag => tag.trim())
      .filter(Boolean)
      .forEach(tag => {
        if (!this.draft.tags.some(existing => this.normalizeText(existing) === this.normalizeText(tag))) {
          this.draft.tags.push(tag);
        }
      });

    this.draft.tagInput = '';
  }

  removeDraftTag(tag: string): void {
    this.draft.tags = this.draft.tags.filter(existing => existing !== tag);
  }

  submitPost(): void {
    if (!this.user || !this.isStyliste) {
      return;
    }

    if (!this.draft.title.trim() || !this.draft.style.trim() || !this.draft.description.trim() || !this.draft.imageFile) {
      void Swal.fire({
        icon: 'warning',
        title: 'Champ manquant',
        text: 'Titre, style, description et image sont obligatoires.',
        confirmButtonText: 'OK',
        confirmButtonColor: '#a46e51',
      });
      return;
    }

    this.savingPost = true;

    const payload: CreateStylistPostRequest = {
      stylisteUserId: this.user.id,
      title: this.draft.title.trim(),
      style: this.draft.style.trim(),
      description: this.draft.description.trim(),
      tags: this.draft.tags,
      imageFile: this.draft.imageFile,
    };

    this.postService.createPost(payload).subscribe({
      next: (post) => {
        this.savingPost = false;
        this.closeCreateModal();

        if (post) {
          this.upsertPost(this.decoratePost({
            ...post,
            stylisteUserId: this.user!.id,
          }));
        } else {
          this.loadPosts();
        }

        void Swal.fire({
          icon: 'success',
          title: 'Post publié',
          text: 'Ta publication est maintenant visible dans le feed.',
          confirmButtonText: 'OK',
          confirmButtonColor: '#a46e51',
          timer: 2200,
          timerProgressBar: true,
        });
      },
      error: (error: Error) => {
        this.savingPost = false;
        void Swal.fire({
          icon: 'error',
          title: 'Publication impossible',
          text: error.message,
          confirmButtonText: 'Réessayer',
          confirmButtonColor: '#a46e51',
        });
      },
    });
  }

  likePost(post: StylistPost): void {
    if (!this.user || !this.isFashionista || this.isReactionLoading(post.postId)) {
      return;
    }

    this.reactingPostIds.add(post.postId);

    this.postService.likePost({
      fashionistaUserId: this.user.id,
      postId: post.postId,
    }).subscribe({
      next: (updated) => {
        this.reactingPostIds.delete(post.postId);

        if (updated) {
          this.upsertReactionState(post.postId, 'LIKE');
          this.upsertPost(this.decoratePost(updated, 'LIKE'));
        } else {
          this.loadPosts();
        }
      },
      error: async (error: Error) => {
        this.reactingPostIds.delete(post.postId);
        await Swal.fire({
          icon: 'error',
          title: 'Action impossible',
          text: error.message,
          confirmButtonColor: '#a46e51',
        });
      },
    });
  }

  dislikePost(post: StylistPost): void {
    if (!this.user || !this.isFashionista || this.isReactionLoading(post.postId)) {
      return;
    }

    this.reactingPostIds.add(post.postId);

    this.postService.dislikePost({
      fashionistaUserId: this.user.id,
      postId: post.postId,
    }).subscribe({
      next: (updated) => {
        this.reactingPostIds.delete(post.postId);

        if (updated) {
          this.upsertReactionState(post.postId, 'DISLIKE');
          this.upsertPost(this.decoratePost(updated, 'DISLIKE'));
        } else {
          this.loadPosts();
        }
      },
      error: async (error: Error) => {
        this.reactingPostIds.delete(post.postId);
        await Swal.fire({
          icon: 'error',
          title: 'Action impossible',
          text: error.message,
          confirmButtonColor: '#a46e51',
        });
      },
    });
  }

  postImage(post: StylistPost): string {
    return post.imageUrl ?? this.resolveImageUrl(post.imagePath);
  }

  postReactionLabel(post: StylistPost): string {
    if (post.myReaction === 'LIKE') {
      return 'Aime';
    }

    if (post.myReaction === 'DISLIKE') {
      return 'Pas pour moi';
    }

    return 'Réagir';
  }

  trackByPostId(index: number, post: StylistPost): number {
    return post.postId;
  }

  clearFilters(): void {
    this.filters = {
      sortBy: 'recent',
      style: 'all',
      tag: 'all',
      stylistName: '',
      reaction: 'all',
    };
  }

  private loadPosts(): void {
    this.loading = true;

    const load$ = this.postService.getAllPosts();
    this.subscriptions.add(
      load$.subscribe({
        next: (posts) => {
          console.log('Posts loaded:', posts);
          this.allPosts = posts.map(post => this.decoratePost(post));
          console.log('All posts after decoration:', this.allPosts);

          if (this.isFashionista && this.user) {
            forkJoin({
              liked: this.postService.getPostsLikedByFashionista(this.user.id),
              disliked: this.postService.getPostsDislikedByFashionista(this.user.id),
            }).subscribe({
              next: ({ liked, disliked }) => {
                this.likedPostIds = new Set(liked.map(post => post.postId));
                this.dislikedPostIds = new Set(disliked.map(post => post.postId));
                this.allPosts = this.allPosts.map(post => this.withReaction(post));
                this.loading = false;
              },
              error: (error) => {
                console.error('Error loading liked/disliked posts:', error);
                this.likedPostIds = new Set();
                this.dislikedPostIds = new Set();
                this.allPosts = this.allPosts.map(post => this.withReaction(post));
                this.loading = false;
              },
            });
            return;
          }

          this.loading = false;
        },
        error: (error: Error) => {
          console.error('Error loading posts:', error);
          this.loading = false;
          void Swal.fire({
            icon: 'error',
            title: 'Feed indisponible',
            text: error.message,
            confirmButtonColor: '#a46e51',
          });
        },
      })
    );
  }

  private upsertPost(post: StylistPost): void {
    const index = this.allPosts.findIndex(item => item.postId === post.postId);
    console.log(`Upsert post ID ${post.postId}, index: ${index}, current posts: ${this.allPosts.length}`);

    if (index === -1) {
      // New post - add to beginning
      this.allPosts = [post, ...this.allPosts];
      console.log(`Added new post. Total posts now: ${this.allPosts.length}`);
      return;
    }

    // Update existing post
    const next = [...this.allPosts];
    next[index] = post;
    this.allPosts = next;
    console.log(`Updated existing post. Total posts: ${this.allPosts.length}`);
  }

  private upsertReactionState(postId: number, reaction: PostReaction): void {
    if (reaction === 'LIKE') {
      this.likedPostIds.add(postId);
      this.dislikedPostIds.delete(postId);
      return;
    }

    if (reaction === 'DISLIKE') {
      this.dislikedPostIds.add(postId);
      this.likedPostIds.delete(postId);
    }
  }

  private withReaction(post: StylistPost): StylistPost {
    const reaction: PostReaction = this.likedPostIds.has(post.postId)
      ? 'LIKE'
      : this.dislikedPostIds.has(post.postId)
        ? 'DISLIKE'
        : null;

    return {
      ...post,
      myReaction: reaction,
    };
  }

  private decoratePost(post: StylistPost, reaction?: PostReaction): StylistPost {
    return {
      ...post,
      imageUrl: this.resolveImageUrl(post.imagePath),
      myReaction: reaction ?? post.myReaction ?? null,
    };
  }

  private sortPosts(posts: StylistPost[]): StylistPost[] {
    const list = [...posts];

    switch (this.filters.sortBy) {
      case 'old':
        return list.sort((a, b) => this.dateValue(a.createdAt) - this.dateValue(b.createdAt));
      case 'likes':
        return list.sort((a, b) => (b.nbrLikes ?? 0) - (a.nbrLikes ?? 0));
      case 'dislikes':
        return list.sort((a, b) => (b.nbrDislikes ?? 0) - (a.nbrDislikes ?? 0));
      default:
        return list.sort((a, b) => this.dateValue(b.createdAt) - this.dateValue(a.createdAt));
    }
  }

  private resolveImageUrl(imagePath: string): string {
    const trimmed = (imagePath || '').trim();
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

    return `${baseUrl}/uploads/posts/${encodeURIComponent(trimmed)}`;
  }

  private isReactionLoading(postId: number): boolean {
    return this.reactingPostIds.has(postId);
  }

  private dateValue(value: string | null | undefined): number {
    const parsed = Date.parse(value || '');
    return Number.isFinite(parsed) ? parsed : 0;
  }

  private uniqueValues(values: string[]): string[] {
    return Array.from(
      new Set(
        values
          .map(value => value?.trim())
          .filter((value): value is string => !!value)
      )
    ).sort((a, b) => a.localeCompare(b, 'fr'));
  }

  private normalizeText(value: string | null | undefined): string {
    return (value || '').trim().toLowerCase();
  }

  private emptyDraft(): PostDraft {
    return {
      title: '',
      style: '',
      description: '',
      tags: [],
      tagInput: '',
      imageFile: null,
      imagePreview: null,
    };
  }

  private resetDraft(): void {
    this.revokePreview();
    this.draft = this.emptyDraft();
  }

  private revokePreview(): void {
    if (this.draft.imagePreview) {
      URL.revokeObjectURL(this.draft.imagePreview);
      this.draft.imagePreview = null;
    }
  }
}
