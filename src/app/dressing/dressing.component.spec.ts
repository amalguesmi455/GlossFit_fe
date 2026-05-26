import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DressingComponent } from './dressing.component';

describe('DressingComponent', () => {
  let component: DressingComponent;
  let fixture: ComponentFixture<DressingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DressingComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DressingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
