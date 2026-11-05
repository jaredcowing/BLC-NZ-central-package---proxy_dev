import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LinksWrapperComponent } from './external-search.component';

describe('ExternalSearchComponent', () => {
  let component: ExternalSearchComponent;
  let fixture: ComponentFixture<ExternalSearchComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExternalSearchComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ExternalSearchComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
