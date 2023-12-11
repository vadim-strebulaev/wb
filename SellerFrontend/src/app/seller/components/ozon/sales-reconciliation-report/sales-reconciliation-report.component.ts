import { Component } from '@angular/core';
import { contracts } from '../../../../RedicyApiClient';
import { ComponentBase } from '../../../service/component-base.component';
import { CalendarMonthChangeEvent } from 'primeng/calendar';
import { EMPTY, catchError, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';
import { TimeService } from '../../../service/time.service';
import { totalmem } from 'os';

interface ISalesOrder extends contracts.OzonSalesOrder {

}
interface ISummary {
    totalOrderCount: number;
    totalSum: number;
    totalProductCount: number;
    sumWithCommission: number;
    cancelledProductCount: number;
    returnedProductCount: number;
    cancelledSum: number;
    returnedSum: number;
    commission: number;
    serviceTotalSum: number;
    orderServiceTotalSum: number;
    orderServiceTotalCount: number;
    services: { [key: number]: number };
    orderServices: { [key: number]: number };
}
@Component({
    selector: 'app-sales-reconciliation-report',
    templateUrl: './sales-reconciliation-report.component.html',
    styleUrls: ['./sales-reconciliation-report.component.scss']
})
export class SalesReconciliationReportComponent extends ComponentBase {
    date: Date;
    data: contracts.OzonSalesOrder[] = [];
    excludedDates: Date[] = [];
    summary: ISummary;
    productPackageIDs: number[] = [];
    loading: boolean = false;

    constructor(private ozonClient: contracts.OzonClient, private messageService: MessageService, private timeService: TimeService) {
        super();
    }

    override ngOnInit(): void {
    }

    getDateRange(): [Date, Date] {
        const date = this.timeService.asUtc(this.date);
        const fromDate = new Date(date);
        const toDate = new Date(date);

        toDate.setMonth(toDate.getMonth() + 1);

        return [fromDate, toDate];
    }

    prepareReport() {
        this.loading = true;
        const [dateFrom, dateTo] = this.getDateRange();

        const correctedFromDate = new Date(dateFrom);
        correctedFromDate.setMonth(correctedFromDate.getMonth() - 1);
        this.ozonClient.findOzonOrders(new contracts.FindPostingsModel({
            dateFrom: correctedFromDate,
            dateTo: dateTo
        }))
            .pipe(takeUntil(this.destroyed))
            .pipe(catchError(error => {
                this.messageService.add({
                    summary: 'Ошибка',
                    severity: 'error',
                    detail: error
                });

                this.loading = false;

                return EMPTY;
            }))
            .subscribe(result => {
                this.data = result.filter(order => order.operations.reduce((acc, operation) => acc ||=
                    operation.operationType == contracts.OperationType.OperationAgentDeliveredToCustomer
                    && (!dateFrom || operation.date >= dateFrom)
                    && (!dateTo || operation.date < dateTo)
                    , false))
                    ;

                const productPackageIDs: Set<number> = new Set<number>();
                const orders: ISalesOrder[] = [];
                const summary: ISummary = {
                    totalOrderCount: 0,
                    totalSum: 0,
                    totalProductCount: 0,
                    sumWithCommission: 0,
                    commission: 0,
                    orderServiceTotalSum: 0,
                    orderServiceTotalCount: 0,
                    serviceTotalSum: 0,
                    cancelledProductCount: 0,
                    returnedProductCount: 0,
                    cancelledSum: 0,
                    returnedSum: 0,
                    services: {},
                    orderServices: {}
                };

                const productPackages = {};
                const orderServices = [];

                for (const order of result) {
                    const operations = order.operations
                        .filter(operation => (!dateFrom || operation.date >= dateFrom)
                            && (!dateTo || operation.date < dateTo))
                        ;

                    const finalized = !!operations.length;

                    for (const operation of operations) {
                        if (operation.postingNumber != order.ozonOrderNumber) {
                            continue;
                        }

                        for (const service of operation.services) {
                            summary.orderServices[service.type] = service.price + summary.services[service.type];
                            summary.orderServiceTotalSum += service.price;
                            summary.orderServiceTotalCount++;

                            orderServices.push(service.price);
                        }
                    }

                    if (!finalized) {
                        continue;
                    }

                    for (const orderItem of order.orderItems) {
                        productPackageIDs.add(orderItem.product.productPackageID);

                        const orderItemOperations = [];
                        if (!productPackages[orderItem.product.productPackageID]) {
                            productPackages[orderItem.product.productPackageID] = {
                                prices: {},
                                operations: []
                            };
                        }

                        const productPackage = productPackages[orderItem.product.productPackageID];

                        if (!productPackage.prices[orderItem.price]) {
                            productPackage.prices[orderItem.price] = {
                                quantity: 0,
                                sum: 0,
                                commission: 0,
                            }
                        }

                        const price = productPackage.prices[orderItem.price];
                        price.quantity += orderItem.quantity;
                        price.sum += orderItem.quantity * orderItem.price;

                        for (const operation of operations) {
                            if (operation.postingNumber == orderItem.postingNumber) {
                                orderItemOperations.push(operation);

                                switch (operation.operationType) {
                                    case contracts.OperationType.OperationAgentDeliveredToCustomer: {
                                        summary.totalProductCount += orderItem.quantity;
                                        price.commission += operation.saleCommission;
                                        summary.commission += operation.saleCommission;
                                        summary.totalSum += orderItem.price * orderItem.quantity;

                                        for (const service of operation.services) {
                                            summary.services[service.type] = service.price + (summary.services[service.type] ?? 0);
                                            summary.serviceTotalSum += service.price;
                                        }

                                        break;
                                    }
                                    case contracts.OperationType.ClientReturnAgentOperation: {
                                        price.commission += operation.saleCommission;
                                        summary.commission += operation.saleCommission;
                                        summary.returnedProductCount += orderItem.quantity;
                                        summary.returnedSum += operation.amount;
                                        summary.totalSum -= orderItem.price * orderItem.quantity;

                                        for (const service of operation.services) {
                                            summary.services[service.type] = service.price + (summary.services[service.type] ?? 0);
                                            summary.serviceTotalSum += service.price;
                                        }

                                        break;
                                    }
                                    case contracts.OperationType.OperationItemReturn: {
                                        summary.commission += operation.saleCommission;
                                        summary.cancelledProductCount += orderItem.quantity;

                                        for (const service of operation.services) {
                                            summary.services[service.type] = service.price + (summary.services[service.type] ?? 0);
                                            summary.serviceTotalSum += service.price;
                                        }

                                        break;
                                    }
                                    default: {
                                        console.log('x', operation)
                                    }
                                }
                            }
                        }
                    }

                    summary.totalOrderCount++;
                }

                this.summary = summary;

                this.loading = false;

                console.log(summary);
            })
            ;
    }
}
