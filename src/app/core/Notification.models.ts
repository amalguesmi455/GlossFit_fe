export interface NotificationUser {
  id: number;
  email: string;
}

export interface StylingRequestRef {
  id: number;
}

export interface Notification {
  id: number;
  recipient: NotificationUser;
  recipientType: 'FASHIONISTA' | 'STYLISTE';
  type: 'REQUEST_CREATED' | 'REQUEST_ACCEPTED' | 'REQUEST_REFUSED' | 'NEW_REQUEST_AVAILABLE';
  message: string;
  stylingRequest: StylingRequestRef | null;
  isRead: boolean;
  createdAt: string; // ISO string from backend
}

export interface UnreadCountResponse {
  unreadCount: number;
}