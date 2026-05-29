import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { ClothingItem } from './clothing-item.service';
import { StylingRequest, StylingRequestUserRef } from './styling-request.service';

export interface StylingProposal {
  id: number;
  stylingRequest?: StylingRequest;
  styliste?: StylingRequestUserRef;
  title: string;
  stylistNote: string;
  status: 'PENDING_REVIEW' | 'ACCEPTED' | 'REFUSED' | string;
  decisionReason?: string;
  decisionAt?: string;
  clothingItems: ClothingItem[];
  createdAt?: string;
  updatedAt?: string;
}

export interface StylingProposalCreatePayload {
  title: string;
  stylistNote: string;
  clothingItemIds: number[];
}

export interface StylingProposalDecisionPayload {
  decision: 'ACCEPTED' | 'REFUSED';
  reason: string;
}

@Injectable({
  providedIn: 'root',
})
export class StylingProposalService {
  private readonly apiUrl = `${environment.apiUrl}/styling-proposals`;

  constructor(private http: HttpClient) {}

  getByRequestId(requestId: number): Observable<StylingProposal[]> {
    return this.http.get<StylingProposal[]>(`${this.apiUrl}/requests/${requestId}`);
  }

  createProposal(requestId: number, payload: StylingProposalCreatePayload): Observable<StylingProposal> {
    return this.http.post<StylingProposal>(`${this.apiUrl}/requests/${requestId}`, payload);
  }

  respondToProposal(proposalId: number, payload: StylingProposalDecisionPayload): Observable<StylingProposal> {
    return this.http.post<StylingProposal>(`${this.apiUrl}/${proposalId}/decision`, payload);
  }
}
