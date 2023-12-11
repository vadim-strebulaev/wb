import { Component } from '@angular/core';
import { ComponentBase } from '../../../service/component-base.component';
import { LazyLoadEvent, MessageService } from 'primeng/api';
import { contracts } from '../../../../RedicyApiClient';
import { BehaviorSubject, EMPTY, catchError, filter, map, switchMap, takeUntil } from 'rxjs';
import { NgxBarcodeScannerService } from '@eisberg-labs/ngx-barcode-scanner';

@Component({
    selector: 'app-ozon-supply-order-list',
    templateUrl: './ozon-supply-order-list.component.html',
    styleUrls: ['./ozon-supply-order-list.component.scss']
})
export class OzonSupplyOrderListComponent extends ComponentBase {
    findSupplyOrdersSubject = new BehaviorSubject<contracts.FindOzonSupplyOrdersModel>(null);
    data: contracts.OzonSupplyOrder[];
    totalRecords: number;
    loading: boolean;
    showScanBarcodeDialog: boolean;
    barcode: string;

    constructor(private ozonService: contracts.OzonClient,
        private messageService: MessageService,
        private barcodeService: NgxBarcodeScannerService
    ) {
        super();
    }

    override ngOnInit(): void {
        this.findSupplyOrdersSubject
            .pipe(filter(item => !!item))
            .pipe(takeUntil(this.destroyed))
            .pipe(map(model => {
                this.findSupplyOrders(model);
            }))
    }

    onValueChanged(code) {
        console.log(code)
    }

    scanBarcode() {
        this.showScanBarcodeDialog = true;
    }

    findSupplyOrders(model: contracts.FindOzonProductsModel) {
        this.ozonService.findOzonSupplyOrders(model)
            .pipe(takeUntil(this.destroyed))
            .pipe(catchError(error => {
                this.messageService.add({
                    summary: 'Ошибка',
                    severity: 'error',
                    detail: error
                })

                return EMPTY;
            }))
            .subscribe(data => {
                this.data = data.items;
                this.totalRecords = data.totalCount
            })
            ;
    }

    onDataLazyLoad(e: LazyLoadEvent) {
        const model = new contracts.FindOzonSupplyOrdersModel({
            offset: e.first,
            count: e.rows
        });

        this.findSupplyOrdersSubject.next(model);

        this.findSupplyOrders(model);
    }

}
