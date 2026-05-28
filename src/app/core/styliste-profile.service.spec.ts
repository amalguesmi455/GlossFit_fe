import { TestBed } from '@angular/core/testing';

import { StylisteProfileService } from './styliste-profile.service';

describe('StylisteProfileService', () => {
  let service: StylisteProfileService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StylisteProfileService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
