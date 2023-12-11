import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OzonWarehouseImportComponent } from './ozon-warehouse-import.component';

describe('OzonWarehouseImportComponent', () => {
  let component: OzonWarehouseImportComponent;
  let fixture: ComponentFixture<OzonWarehouseImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OzonWarehouseImportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OzonWarehouseImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
