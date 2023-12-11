import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OzonSalesOrderListComponent } from './ozon-sales-order-list.component';

describe('OzonPostingListComponent', () => {
  let component: OzonSalesOrderListComponent;
  let fixture: ComponentFixture<OzonSalesOrderListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OzonSalesOrderListComponent]
    });
    fixture = TestBed.createComponent(OzonSalesOrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
