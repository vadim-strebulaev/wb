import { ComponentFixture, TestBed } from '@angular/core/testing';

import { WbComponent } from './wb.component';

describe('WbComponent', () => {
  let component: WbComponent;
  let fixture: ComponentFixture<WbComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [WbComponent]
    });
    fixture = TestBed.createComponent(WbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
