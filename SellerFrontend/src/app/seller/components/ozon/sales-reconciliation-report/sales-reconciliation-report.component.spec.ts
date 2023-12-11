import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesReconciliationReportComponent } from './sales-reconciliation-report.component';

describe('SalesReconciliationReportComponent', () => {
  let component: SalesReconciliationReportComponent;
  let fixture: ComponentFixture<SalesReconciliationReportComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SalesReconciliationReportComponent]
    });
    fixture = TestBed.createComponent(SalesReconciliationReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
