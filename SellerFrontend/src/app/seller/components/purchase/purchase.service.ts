import { Injectable } from '@angular/core';
import { BehaviorSubject, EMPTY, Observable, catchError } from 'rxjs';
import { contracts } from '../../../RedicyApiClient';
import { MessageService } from 'primeng/api';

export interface ISalesPlanCostInfo {
    packageTotalCost: number;
    commissionPercent: number;
    commissionTotal: number;
}

@Injectable({
    providedIn: 'root'
})
export class PurchaseService {
    private packageTypes: BehaviorSubject<contracts.PackageTypeWithPrice[]> = new BehaviorSubject<contracts.PackageTypeWithPrice[]>([]);

    constructor(private packageTypeClient: contracts.PackageTypeClient,
        private messageService: MessageService,
        private purchaseClient: contracts.PurchaseBatchClient
    ) {
        this.packageTypeClient.getPackageTypesWithLatestPrices()
            .pipe(catchError(error => {
                this.messageService.add({
                    summary: 'Ошибка загрузки списка типов упаковки',
                    severity: 'error',
                    detail: error
                })

                return EMPTY;
            }))
            .subscribe(result => {
                this.packageTypes.next(result);
            });
    }

    getBatch(batchID: number): Observable<contracts.PurchaseBatch> {
        return this.purchaseClient.getPurchaseBatch(batchID);
    }

    getSalesPlanSelfCost(salesItem: contracts.SalesItem, salesPlan: contracts.SalesPlan, batchItem: contracts.PurchaseBatchItem) {
        const packagingCost = this.getSalesItemCosts(salesItem);
        const commission = this.getSalesPlanCommission(salesPlan);
        const returnCost = salesPlan.returnCost * salesPlan.returnPercentage / 100;
        const deliveryCost = Math.ceil(salesPlan.deliveryCost * 100 / salesPlan.amount) / 100;

        const result = batchItem.price + packagingCost + commission + returnCost + deliveryCost;

        return result;
    }

    getPackageTypes(): contracts.PackageType[] {
        return this.packageTypes.value;
    }

    getPackageType(packageTypeID: number): contracts.PackageType {
        return this.packageTypes.value
            .find(packageType => packageType.iD == packageTypeID)
            ;
    }

    getSalesItemCosts(salesItem: contracts.SalesItem): number {
        let result = 0;

        for (const itemPackage of salesItem.salesItemPackages) {
            result += Math.ceil(itemPackage.pricePerUom * itemPackage.amount * 100) / 100;
        }

        result += salesItem.packagingPrice;

        result = Math.ceil(result * 100) / 100;

        return result;
    }

    getSalesPlanCommission(salesPlan: contracts.SalesPlan): number {
        const commissionPercent = Math.ceil((salesPlan.commissionMultiplier * salesPlan.price)) / 100;

        return commissionPercent + salesPlan.commissionAddition;
    }

    calcPlans() {
        this.purchaseClient.calcSalesPlans()
            .pipe(catchError(error => {
                this.messageService.add({
                    summary: 'Ошибка загрузки списка типов упаковки',
                    severity: 'error',
                    detail: error
                })

                return EMPTY;
            }))
            .subscribe(() => {
                this.messageService.add({
                    summary: 'Успех',
                    severity: 'success',
                    detail: 'Перерасчёт планов продаж успешно завершён'
                })
            })
    }

    getSalesPlansSummaries(salesPlanIDs: number[]): Observable<contracts.SalesPlanSummary[]> {
        return this.purchaseClient.getSalesPlansSummaries(salesPlanIDs);
    }
}
