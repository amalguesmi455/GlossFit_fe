import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateProfileStylisteComponent } from './create-profile-styliste.component';

describe('CreateProfileStylisteComponent', () => {
  let component: CreateProfileStylisteComponent;
  let fixture: ComponentFixture<CreateProfileStylisteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CreateProfileStylisteComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateProfileStylisteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
