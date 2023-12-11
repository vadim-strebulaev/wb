import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductImageAnimatorComponent } from './product-image-animator.component';

describe('ProductImageAnimatorComponent', () => {
  let component: ProductImageAnimatorComponent;
  let fixture: ComponentFixture<ProductImageAnimatorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductImageAnimatorComponent]
    });
    fixture = TestBed.createComponent(ProductImageAnimatorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
