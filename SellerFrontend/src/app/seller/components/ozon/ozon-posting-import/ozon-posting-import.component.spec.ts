import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OzonPostingImportComponent } from './ozon-posting-import.component';

describe('OzonPostingImportComponent', () => {
    let component: OzonPostingImportComponent;
    let fixture: ComponentFixture<OzonPostingImportComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [OzonPostingImportComponent]
        })
            .compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(OzonPostingImportComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
