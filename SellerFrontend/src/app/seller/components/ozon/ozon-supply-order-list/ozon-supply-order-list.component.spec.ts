import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OzonSupplyOrderListComponent } from './ozon-supply-order-list.component';

describe('OzonSupplyOrderListComponent', () => {
  let component: OzonSupplyOrderListComponent;
  let fixture: ComponentFixture<OzonSupplyOrderListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OzonSupplyOrderListComponent]
    });
    fixture = TestBed.createComponent(OzonSupplyOrderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
