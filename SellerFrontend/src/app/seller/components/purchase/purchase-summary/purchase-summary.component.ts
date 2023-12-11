import { Component, Input, OnInit, forwardRef } from '@angular/core';
import { contracts } from '../../../../RedicyApiClient';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { PurchaseService } from '../purchase.service';
import { BehaviorSubject, filter, map, switchMap, takeUntil } from 'rxjs';
import { ComponentBase } from '../../../service/component-base.component';
import { ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-purchase-summary',
    templateUrl: './purchase-summary.component.html',
    styleUrls: ['./purchase-summary.component.scss'],
    providers: [{
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => PurchaseSummaryComponent),
        multi: true
    }]
})
export class PurchaseSummaryComponent extends ComponentBase {
    @Input()
    batchID: BehaviorSubject<number> = new BehaviorSubject<number>(null);
    salesPlanIDs: BehaviorSubject<number[]> = new BehaviorSubject<number[]>([]);
    batch: contracts.PurchaseBatch;
    salesInfo: any;
    batchInfo: any;
    summaries: contracts.SalesPlanSummary[];

    constructor(private purchaseService: PurchaseService, private route: ActivatedRoute) {
        super();
    }
    override ngOnInit(): void {

        const id = +this.route.snapshot.paramMap.get('id');

        if (id > 0) {
            this.batchID.next(id);
        }

        this.batchID
            .pipe(takeUntil(this.destroyed))
            .pipe(filter(item => !!item))
            .pipe(switchMap(batchID => this.purchaseService.getBatch(batchID)))
            .subscribe(batch => {
                this.batch = batch;
                this.updateBatchInfo();
            })

        this.salesPlanIDs
            .pipe(takeUntil(this.destroyed))
            .pipe(filter(item => !!item?.length))
            .pipe(switchMap(ids => this.purchaseService.getSalesPlansSummaries(ids)))
            .subscribe(summaries => {
                this.summaries = summaries;
                this.salesInfo = this.getSalesInfo(this.batch, summaries);
            })
    }

    updateBatchInfo(): void {
        this.batchInfo = this.batch ? this.getBatchInfo(this.batch) : {};
        this.salesInfo = {};
        this.summaries = [];

        this.salesPlanIDs.next(this.batch.items.reduce((acc, batchItem) => {
            return batchItem.salesItems.reduce((_, salesItem) => {
                return salesItem.salesPlans.reduce((_, salesPlan) => {
                    acc.push(salesPlan.iD);

                    return acc;
                }, acc);
            }, acc)
        }, []));
    }

    getBatchInfo(batch: contracts.PurchaseBatch) {
        const result: any = {
        };

        result.sum = batch.items.reduce((acc, batchItem) => acc + batchItem.count * batchItem.price, 0);
        result.productCount = batch.items.reduce((acc, batchItem) => acc + batchItem.count, 0);
        result.positionCount = batch.items.length;

        return result;
    }

    getSalesInfo(batch: contracts.PurchaseBatch, summaries: contracts.SalesPlanSummary[]) {
        const result: any = {

        };

        const salesChannels = [];
        for (const batchItem of batch.items) {
            let salesCount = 0;

            for (const salesItem of batchItem.salesItems) {
                const salesItemCost = this.purchaseService.getSalesItemCosts(salesItem);

                for (const salesPlan of salesItem.salesPlans) {
                    const summary = summaries.find(item => item.iD == salesPlan.iD);

                    let salesChannelSummary = salesChannels.find(channel => channel.channelID == salesPlan.salesChannelID);
                    if (!salesChannelSummary) {
                        salesChannelSummary = {
                            channelID: salesPlan.salesChannelID,
                            name: salesPlan.salesChannel.name,
                            plans: [],
                        };

                        salesChannels.push(salesChannelSummary);
                    }

                    const selfCost = this.purchaseService.getSalesPlanSelfCost(salesItem, salesPlan, batchItem);

                    const salesSum = salesPlan.price * salesPlan.amount;
                    const salesCost = selfCost * salesPlan.amount;
                    const totalCost = this.purchaseService.getSalesPlanSelfCost(salesItem, salesPlan, batchItem) * salesPlan.amount;
                    const packageCost = this.purchaseService.getSalesItemCosts(salesItem) * salesPlan.amount;

                    salesChannelSummary.plans.push({
                        name: salesItem.productPackage.name + ', ' + salesItem.name,
                        plannedAmount: salesPlan.amount,
                        soldAmount: summary.salesCount,
                        plannedSum: salesPlan.price * salesPlan.amount,
                        soldSum: summary.salesSum,
                        plannedCommissionAddition: -salesPlan.commissionAddition * salesPlan.amount,
                        plannedCommissionPercent: -Math.ceil(salesPlan.amount * salesPlan.price * salesPlan.commissionMultiplier / 100),
                        commissionAddition: summary.commissionAddition,
                        commissionPercent: summary.commissionPercent,
                        plannedReturnCount: Math.ceil(salesPlan.amount * salesPlan.returnPercentage / 100),
                        returnCount: summary.returnCount,
                        plannedProfit: salesPlan.amount * salesPlan.price - totalCost - salesPlan.deliveryCost,
                        profit: summary.salesSum - summary.returnSum + summary.commissionPercent + summary.commissionAddition
                            - packageCost
                            - salesPlan.deliveryCost
                            - batchItem.count * batchItem.price
                        ,
                    });
                }
            }
        }

        result.salesChannels = salesChannels;

        return result;
    }

    calcPlans() {
        this.purchaseService.calcPlans();
    }
}
