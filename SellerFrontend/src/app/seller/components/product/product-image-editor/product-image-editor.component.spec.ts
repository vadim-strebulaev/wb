import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductImageEditorComponent } from './product-image-editor.component';

describe('ProductImageEditorComponent', () => {
  let component: ProductImageEditorComponent;
  let fixture: ComponentFixture<ProductImageEditorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductImageEditorComponent]
    });
    fixture = TestBed.createComponent(ProductImageEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
