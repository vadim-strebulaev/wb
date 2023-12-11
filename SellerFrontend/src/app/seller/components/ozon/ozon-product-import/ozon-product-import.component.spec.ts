import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OzonProductImportComponent } from './ozon-product-import.component';

describe('OzonProductImportComponent', () => {
  let component: OzonProductImportComponent;
  let fixture: ComponentFixture<OzonProductImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OzonProductImportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OzonProductImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
