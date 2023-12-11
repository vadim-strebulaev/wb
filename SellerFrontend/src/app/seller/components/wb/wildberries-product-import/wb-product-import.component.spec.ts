import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WbProductImportComponent } from './wb-product-import.component';

describe('WbProductImportComponent', () => {
  let component: WbProductImportComponent;
  let fixture: ComponentFixture<WbProductImportComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ WbProductImportComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(WbProductImportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
