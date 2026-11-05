import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HathiTrustComponent } from './external-search.component';

describe('HathiTrustComponent', () => {
  let component: HathiTrustComponent;
  let fixture: ComponentFixture<HathiTrustComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HathiTrustComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HathiTrustComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
