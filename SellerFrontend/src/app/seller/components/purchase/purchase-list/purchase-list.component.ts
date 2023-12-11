import { Component } from '@angular/core';
import { ComponentBase } from '../../../service/component-base.component';
import { contracts } from '../../../../RedicyApiClient';
import { LazyLoadEvent, MessageService } from 'primeng/api';
import { BehaviorSubject, EMPTY, catchError, filter, map, switchMap } from 'rxjs';

interface IPurchaseBatch extends contracts.PurchaseBatch {
    products: { [key: number]: contracts.ProductPackage };
}

interface IPurchaseBatchItemInfo extends contracts.PurchaseBatchItem {
}

@Component({
    selector: 'app-purchase-list',
    templateUrl: './purchase-list.component.html',
    styleUrls: ['./purchase-list.component.scss']
})
export class PurchaseListComponent extends ComponentBase {
    data: IPurchaseBatch[];
    loading: boolean = true;
    totalRecords: number = 0;
    purchaseFilterSubject = new BehaviorSubject<contracts.FindPurchaseBatchesModel>(null);

    constructor(private productBatchService: contracts.PurchaseBatchClient,
        private messageService: MessageService) {
        super();
    }

    override ngOnInit(): void {
        this.purchaseFilterSubject
            .pipe(filter(item => !!item))
            .pipe(switchMap(model => {
                return this.productBatchService.findPurchaseBatches(model)
            }))
            .pipe(catchError(error => {
                this.messageService.add({
                    summary: 'Ошибка загрузки списка закупок',
                    severity: 'error',
                    detail: error
                })

                this.loading = false;

                return EMPTY;
            }))
            .subscribe(data => {
                this.data = data.items
                    .map(item => {
                        const batch = <IPurchaseBatch>item;
                        const products = {};

                        item.items.forEach(batchItem => {
                            const extendedBatchItem = <IPurchaseBatchItemInfo>batchItem;

                            batchItem.salesItems
                                .forEach(salesItem => {
                                    products[salesItem.productPackageID] = salesItem.productPackage;
                                });
                        });

                        batch.products = Object.keys(products).map(key => products[key]);
                        console.log(products);
                        return batch;
                    });
                this.totalRecords = data.totalCount;
                console.log(this.data);

                this.loading = false;
            })
            ;

        this.purchaseFilterSubject.next(new contracts.FindPurchaseBatchesModel({
            count: 0,
            offset: 0
        }));
    }

    onDataLazyLoad(e: LazyLoadEvent) {
        const model = new contracts.FindPurchaseBatchesModel({
            offset: e.first,
            count: e.rows
        });

        this.purchaseFilterSubject.next(model);
    }
}
