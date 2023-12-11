import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductProductPackageListComponent } from './product-product-package-list.component';

describe('ProductProductPackageListComponent', () => {
  let component: ProductProductPackageListComponent;
  let fixture: ComponentFixture<ProductProductPackageListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductProductPackageListComponent]
    });
    fixture = TestBed.createComponent(ProductProductPackageListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
