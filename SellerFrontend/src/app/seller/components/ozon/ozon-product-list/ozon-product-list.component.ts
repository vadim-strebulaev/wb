import { Component } from '@angular/core';
import { contracts } from '../../../../RedicyApiClient';
import { BehaviorSubject, EMPTY, catchError, takeUntil } from 'rxjs';
import { ComponentBase } from '../../../service/component-base.component';
import { LazyLoadEvent, MessageService } from 'primeng/api';
import * as JsBarcode from 'jsbarcode';

@Component({
    selector: 'app-ozon-product-list',
    templateUrl: './ozon-product-list.component.html',
    styleUrls: ['./ozon-product-list.component.scss']
})
export class OzonProductListComponent extends ComponentBase {
    findProductsSubject = new BehaviorSubject<contracts.FindOzonProductsModel>(null);
    data: contracts.OzonProduct[];
    totalRecords: number;
    loading: boolean;
    selectedProductForBarcode: contracts.OzonProduct;
    px2mmFactor: number;
    barcodeHeight: number = 10;
    barcodeTexts: {text: string, fontSize: number, bold: boolean}[];
    barcodeImage: string;
    barcodeData: { offset: number, width: number }[];

    addBarcodeText() {
        this.barcodeTexts = [...this.barcodeTexts, { fontSize: 10, text: '', bold: false }];
    }

    constructor(private ozonService: contracts.OzonClient, private messageService: MessageService) {
        super();
    }

    override ngOnInit(): void {
        this.px2mmFactor = this.calcPx2MmFactor();

    }

    findProducts(model: contracts.FindOzonProductsModel) {
        this.ozonService.findOzonProducts(model)
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
        const model = new contracts.FindProductsModel({
            offset: e.first,
            count: e.rows
        });

        this.findProducts(model);
    }

    onShowBarcodeDialog() {
        this.barcodeTexts = []
    }

    private calcPx2MmFactor() {
        let e = document.createElement('div');
        e.style.position = 'absolute';
        e.style.width = '100mm';
        document.body.appendChild(e);
        let rect = e.getBoundingClientRect();
        document.body.removeChild(e);
        return rect.width / 100;
    }

    showBarcodeGenerator(product: contracts.OzonProduct) {
        if (product.barcodes?.length > 0) {
            this.selectedProductForBarcode = product;
            const data = this.selectedProductForBarcode.barcodes[0];
            const rawData: any = {};
            JsBarcode(rawData, data, {
                format: 'code128', // default
                height: this.barcodeHeight * this.px2mmFactor,
                text: data,
                background: 'rgba(255, 255, 255, 1)',
                font: 'monospace',
                fontOptions: 'bold',
                marginTop: 0,
                fontSize: 16,
                lineColor: 'black',
                margin: 2 * this.px2mmFactor,
                textMargin: 0,
                flat: true
            });
            console.log(rawData);
            let offset = 0;
            let items = [];
            let lastItem: { offset: number, width: number };

            for (let i = 0; i < rawData.encodings[0].data.length; i++) {
                if (rawData.encodings[0].data[i] == '1') {
                    if (lastItem) {
                        lastItem.width++;
                    } else {
                        lastItem = {
                            width: 1,
                            offset: i
                        };
                    }
                } else if (lastItem?.width > 0) {
                    items.push(lastItem);
                    lastItem = null
                }
            }

            if (lastItem) {
                items.push(lastItem);
            }

            console.log(items);

            this.barcodeData = items;
        }
    }

    async downloadBarcode() {
        const promise = new Promise(resolve => {
            try {
                const svg = document.getElementById('barcodeImage');
                const textData = svg.outerHTML;

                const base64Data = btoa(encodeURIComponent(textData).replace(/%([0-9A-F]{2})/g,
                    (_, value) => {
                        return String.fromCharCode(parseInt(value, 16));
                    }));

                const link = <HTMLAnchorElement>document.createElement('a');
                link.href = 'data:image/svg+xml;base64,' + base64Data;
                link.download = this.selectedProductForBarcode.productPackageID + '.svg';
                link.click();
            } catch (error) {
                this.messageService.add({
                    summary: 'Ошибка',
                    severity: 'error',
                    detail: error
                })
            }
        });

        await promise;

    }
}
