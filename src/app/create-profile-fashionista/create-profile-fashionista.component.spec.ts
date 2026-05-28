import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProfileFashionistaComponent } from './create-profile-fashionista.component';

describe('CreateProfileFashionistaComponent', () => {
  let component: CreateProfileFashionistaComponent;
  let fixture: ComponentFixture<CreateProfileFashionistaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateProfileFashionistaComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateProfileFashionistaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
