export type PostReaction = 'LIKE' | 'DISLIKE' | null;

export interface StylistPost {
  postId: number;
  stylisteUserId: number | null;
  stylisteName: string;
  title: string;
  style: string;
  imagePath: string;
  tags: string[];
  nbrLikes: number;
  nbrDislikes: number;
  description: string;
  createdAt: string;
  myReaction?: PostReaction;
  imageUrl?: string;
}

export interface CreateStylistPostRequest {
  stylisteUserId: number;
  title: string;
  style: string;
  description: string;
  tags: string[];
  imageFile: File;
}

export interface PostReactionRequest {
  fashionistaUserId: number;
  postId: number;
}
