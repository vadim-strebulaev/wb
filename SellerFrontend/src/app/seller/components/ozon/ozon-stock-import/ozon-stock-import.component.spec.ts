import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OzonStockImportComponent } from './ozon-stock-import.component';

describe('OzonStockImportComponent', () => {
    let component: OzonStockImportComponent;
    let fixture: ComponentFixture<OzonStockImportComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OzonStockImportComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OzonStockImportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
