import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OzonTransactionListComponent } from './ozon-transaction-list.component';

describe('OzonTransactionListComponent', () => {
  let component: OzonTransactionListComponent;
  let fixture: ComponentFixture<OzonTransactionListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OzonTransactionListComponent]
    });
    fixture = TestBed.createComponent(OzonTransactionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
