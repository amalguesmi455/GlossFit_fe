import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, from, map, switchMap } from 'rxjs';

import { environment } from '../../environments/environment';
import {
  CreateStylistPostRequest,
  PostReactionRequest,
  StylistPost,
  PostReaction,
} from './stylist-post.models';

interface FilePayload {
  fileName: string;
  contentType: string;
  contentBase64: string;
}

@Injectable({
  providedIn: 'root',
})
export class StylistPostSoapService {
  private readonly endpoint = `${environment.apiUrl.replace(/\/api$/, '')}/ws/styliste-posts`;
  private readonly namespace = 'http://impl.services.glossfit.poc.com/';

  constructor(private http: HttpClient) {}

  getAllPosts(): Observable<StylistPost[]> {
    return this.callSoap('GetAllPosts', `<ns:GetAllPosts />`).pipe(
      map(xml => this.parsePosts(xml))
    );
  }

  createPost(request: CreateStylistPostRequest): Observable<StylistPost | null> {
    return from(this.readFile(request.imageFile)).pipe(
      switchMap(file => this.callSoap(
        'CreatePost',
        `
          <ns:CreatePost>
            <arg0>
              <stylisteUserId>${request.stylisteUserId}</stylisteUserId>
              <title>${this.escapeXml(request.title)}</title>
              <style>${this.escapeXml(request.style)}</style>
              <description>${this.escapeXml(request.description)}</description>
              ${request.tags.map(tag => `<tags>${this.escapeXml(tag)}</tags>`).join('')}
              <imageFileName>${this.escapeXml(file.fileName)}</imageFileName>
              <imageContentType>${this.escapeXml(file.contentType)}</imageContentType>
              <imageContent>${file.contentBase64}</imageContent>
            </arg0>
          </ns:CreatePost>
        `
      )),
      map(xml => this.tryParsePost(xml))
    );
  }

  likePost(request: PostReactionRequest): Observable<StylistPost | null> {
    return this.react('LikePost', request);
  }

  dislikePost(request: PostReactionRequest): Observable<StylistPost | null> {
    return this.react('DislikePost', request);
  }

  getPostsLikedByFashionista(fashionistaUserId: number): Observable<StylistPost[]> {
    return this.callSoap(
      'GetPostsLikedByFashionista',
      `<ns:GetPostsLikedByFashionista><fashionistaUserId>${fashionistaUserId}</fashionistaUserId></ns:GetPostsLikedByFashionista>`
    ).pipe(map(xml => this.parsePosts(xml)));
  }

  getPostsDislikedByFashionista(fashionistaUserId: number): Observable<StylistPost[]> {
    return this.callSoap(
      'GetPostsDislikedByFashionista',
      `<ns:GetPostsDislikedByFashionista><fashionistaUserId>${fashionistaUserId}</fashionistaUserId></ns:GetPostsDislikedByFashionista>`
    ).pipe(map(xml => this.parsePosts(xml)));
  }

  private react(operation: 'LikePost' | 'DislikePost', request: PostReactionRequest): Observable<StylistPost | null> {
    return this.callSoap(
      operation,
      `
        <ns:${operation}>
          <arg0>
            <fashionistaUserId>${request.fashionistaUserId}</fashionistaUserId>
            <postId>${request.postId}</postId>
          </arg0>
        </ns:${operation}>
      `
    ).pipe(map(xml => this.tryParsePost(xml)));
  }

  private callSoap(operation: string, innerBody: string): Observable<string> {
    const envelope = `
      <?xml version="1.0" encoding="UTF-8"?>
      <soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:ns="${this.namespace}">
        <soapenv:Header />
        <soapenv:Body>
          ${innerBody}
        </soapenv:Body>
      </soapenv:Envelope>
    `;

    const headers = new HttpHeaders({
      'Content-Type': 'text/xml; charset=utf-8',
      Accept: 'text/xml',
    });

    return this.http.post(this.endpoint, envelope.trim(), {
      headers,
      responseType: 'text',
    }).pipe(map(response => response as string));
  }

  private parsePosts(xml: string): StylistPost[] {
    const doc = this.parseXml(xml);
    return this.extractPostNodes(doc).reduce<StylistPost[]>((posts, node) => {
      const parsed = this.parsePostContainer(node, doc).filter((post): post is StylistPost => !!post);
      return posts.concat(parsed);
    }, []);
  }

  private parsePost(xml: string): StylistPost {
    const doc = this.parseXml(xml);
    const post = this.extractPostNodes(doc)
      .reduce<StylistPost[]>((posts, node) => {
        const parsed = this.parsePostContainer(node, doc).filter((item): item is StylistPost => !!item);
        return posts.concat(parsed);
      }, [])
      .find((value): value is StylistPost => !!value);

    if (!post) {
      throw new Error('Unable to parse SOAP post response.');
    }

    return post;
  }

  private extractPostNodes(doc: Document): Element[] {
    const allElements = Array.from(doc.getElementsByTagName('*'));
    const candidates = allElements.filter(element => this.looksLikePostContainer(element));

    if (candidates.length === 0) {
      return [];
    }

    return candidates.filter(candidate =>
      !candidates.some(other => other !== candidate && other.contains(candidate))
    );
  }

  private parsePostContainer(node: Element, doc: Document): StylistPost[] {
    if (this.countDirectChildren(node, 'postId') > 1) {
      return this.parseFlatPostList(node, doc);
    }

    const post = this.parsePostNode(node);
    return post ? [post] : [];
  }

  private hasPostField(element: Element, fieldName: string): boolean {
    return Array.from(element.children).some(child => this.localName(child) === fieldName);
  }

  private countDirectChildren(element: Element, fieldName: string): number {
    return Array.from(element.children).filter(child => this.localName(child) === fieldName).length;
  }

  private looksLikePostContainer(element: Element): boolean {
    const childNames = Array.from(element.children).map(child => this.localName(child));

    if (!childNames.includes('postId')) {
      return false;
    }

    return ['title', 'style', 'imagePath', 'description', 'stylisteName', 'nbrLikes', 'nbrDislikes', 'createdAt']
      .some(fieldName => childNames.includes(fieldName) || this.hasPostField(element, fieldName));
  }

  private parseFlatPostList(node: Element, doc: Document): StylistPost[] {
    const posts: StylistPost[] = [];
    let currentPost: Element | null = null;

    for (const child of Array.from(node.children)) {
      if (this.localName(child) === 'postId') {
        if (currentPost) {
          const parsed = this.parsePostNode(currentPost);
          if (parsed) {
            posts.push(parsed);
          }
        }

        currentPost = doc.createElement('postWrapper');
      }

      if (currentPost) {
        currentPost.appendChild(child.cloneNode(true));
      }
    }

    if (currentPost) {
      const parsed = this.parsePostNode(currentPost);
      if (parsed) {
        posts.push(parsed);
      }
    }

    return posts;
  }

  private parsePostNode(node: Element): StylistPost | null {
    const postId = this.toNumber(this.getText(node, 'postId'));
    if (postId == null) {
      return null;
    }

    return {
      postId,
      stylisteUserId: this.toNumber(this.getText(node, 'stylisteUserId')),
      stylisteName: this.getText(node, 'stylisteName') ?? '',
      title: this.getText(node, 'title') ?? '',
      style: this.getText(node, 'style') ?? '',
      imagePath: this.getText(node, 'imagePath') ?? '',
      tags: this.readTags(node),
      nbrLikes: this.toNumber(this.getText(node, 'nbrLikes')) ?? 0,
      nbrDislikes: this.toNumber(this.getText(node, 'nbrDislikes')) ?? 0,
      description: this.getText(node, 'description') ?? '',
      createdAt: this.getText(node, 'createdAt') ?? '',
    };
  }

  private tryParsePost(xml: string): StylistPost | null {
    try {
      return this.parsePost(xml);
    } catch {
      return null;
    }
  }

  private getText(node: Element, tagName: string): string | null {
    // First try direct child
    const directChild = Array.from(node.children).find(el => this.localName(el) === tagName);
    if (directChild) {
      return directChild.textContent?.trim() || null;
    }

    // Then try nested search (for compatibility)
    const matches = Array.from(node.getElementsByTagName('*'))
      .find(el => this.localName(el) === tagName);

    return matches?.textContent?.trim() || null;
  }

  private readTags(node: Element): string[] {
    const tags = new Set<string>();
    const containers = Array.from(node.getElementsByTagName('*')).filter(el => this.localName(el) === 'tags');

    for (const container of containers) {
      const childElements = Array.from(container.children);

      if (childElements.length === 0) {
        const text = container.textContent?.trim();
        if (text) {
          text.split(',').map(value => value.trim()).filter(Boolean).forEach(value => tags.add(value));
        }
        continue;
      }

      for (const child of childElements) {
        const text = child.textContent?.trim();
        if (text) {
          tags.add(text);
        }
      }
    }

    return Array.from(tags);
  }

  private parseXml(xml: string): Document {
    const parser = new DOMParser();
    const doc = parser.parseFromString(xml, 'application/xml');
    const parserError = doc.getElementsByTagName('parsererror')[0];

    if (parserError) {
      throw new Error('Unable to parse SOAP XML response.');
    }

    return doc;
  }

  private localName(element: Element): string {
    return element.localName || element.nodeName.split(':').pop() || element.nodeName;
  }

  private toNumber(value: string | null): number | null {
    if (value == null || value === '') {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private escapeXml(value: string): string {
    return String(value ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  private readFile(file: File): Promise<FilePayload> {
    return file.arrayBuffer().then(buffer => {
      const bytes = new Uint8Array(buffer);
      const chunkSize = 0x8000;
      let binary = '';

      for (let index = 0; index < bytes.length; index += chunkSize) {
        binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
      }

      return {
        fileName: file.name,
        contentType: file.type || 'application/octet-stream',
        contentBase64: btoa(binary),
      };
    });
  }
}
