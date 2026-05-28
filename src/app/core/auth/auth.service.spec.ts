import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { environment } from '../../../environments/environment';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('keeps hasProfile true when the API returns has_profile', () => {
    let receivedUser = null;

    service.signIn({
      email: 'fashionista@example.com',
      password: 'secret123',
    }).subscribe(user => {
      receivedUser = user;
    });

    const request = httpMock.expectOne(`${environment.apiUrl}/auth/sign-in`);
    request.flush({
      accessToken: 'access-token',
      refreshToken: 'refresh-token',
      userId: 42,
      email: 'fashionista@example.com',
      role: 'FASHIONISTA',
      has_profile: true,
    });

    expect(receivedUser).toEqual(
      jasmine.objectContaining({
        id: 42,
        email: 'fashionista@example.com',
        role: 'FASHIONISTA',
        hasProfile: true,
      })
    );
    expect(service.currentUser?.hasProfile).toBeTrue();
    expect(JSON.parse(localStorage.getItem('glossfit_user') ?? '{}').hasProfile).toBeTrue();
  });
});
