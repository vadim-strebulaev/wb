import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PurchaseEditorComponent } from './purchase-editor.component';

describe('ArticleCalculationComponent', () => {
  let component: PurchaseEditorComponent;
  let fixture: ComponentFixture<PurchaseEditorComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PurchaseEditorComponent]
    });
    fixture = TestBed.createComponent(PurchaseEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
