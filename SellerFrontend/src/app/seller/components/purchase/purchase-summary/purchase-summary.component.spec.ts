import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseSummaryComponent } from './purchase-summary.component';

describe('PurchaseSummaryComponent', () => {
  let component: PurchaseSummaryComponent;
  let fixture: ComponentFixture<PurchaseSummaryComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PurchaseSummaryComponent]
    });
    fixture = TestBed.createComponent(PurchaseSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
