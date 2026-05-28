import { TestBed } from '@angular/core/testing';

import { FashionistaProfileService } from './fashionista-profile.service';

describe('FashionistaProfileService', () => {
  let service: FashionistaProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FashionistaProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
