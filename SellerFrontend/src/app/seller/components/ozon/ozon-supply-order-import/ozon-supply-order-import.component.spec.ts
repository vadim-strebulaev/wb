import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OzonSupplyOrderImportComponent } from './ozon-supply-order-import.component';

describe('OzonSupplyOrderImportComponent', () => {
    let component: OzonSupplyOrderImportComponent;
    let fixture: ComponentFixture<OzonSupplyOrderImportComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OzonSupplyOrderImportComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OzonSupplyOrderImportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
