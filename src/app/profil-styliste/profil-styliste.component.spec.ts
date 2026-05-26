import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilStylisteComponent } from './profil-styliste.component';

describe('ProfilStylisteComponent', () => {
  let component: ProfilStylisteComponent;
  let fixture: ComponentFixture<ProfilStylisteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilStylisteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfilStylisteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
