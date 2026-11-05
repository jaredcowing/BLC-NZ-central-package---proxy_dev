import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinksWrapperComponent } from './links-wrapper.component';

describe('LinksWrapperComponent', () => {
  let component: LinksWrapperComponent;
  let fixture: ComponentFixture<LinksWrapperComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LinksWrapperComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LinksWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
