import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OzonTransactionImportComponent } from './ozon-transaction-import.component';

describe('OzonProductImportComponent', () => {
    let component: OzonTransactionImportComponent;
    let fixture: ComponentFixture<OzonTransactionImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
        declarations: [OzonTransactionImportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
      fixture = TestBed.createComponent(OzonTransactionImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
