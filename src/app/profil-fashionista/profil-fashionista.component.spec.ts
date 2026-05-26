import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProfilFashionistaComponent } from './profil-fashionista.component';

describe('ProfilFashionistaComponent', () => {
  let component: ProfilFashionistaComponent;
  let fixture: ComponentFixture<ProfilFashionistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProfilFashionistaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProfilFashionistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
