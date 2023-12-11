import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OzonProductListComponent } from './ozon-product-list.component';

describe('OzonProductListComponent', () => {
  let component: OzonProductListComponent;
  let fixture: ComponentFixture<OzonProductListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OzonProductListComponent]
    });
    fixture = TestBed.createComponent(OzonProductListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
