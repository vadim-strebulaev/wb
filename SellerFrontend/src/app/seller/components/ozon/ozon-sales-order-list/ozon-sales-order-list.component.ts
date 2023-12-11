import { Component, OnInit } from '@angular/core';
import { BehaviorSubject, EMPTY, catchError, filter, map, switchMap, takeUntil } from 'rxjs';
import { FilterService, MessageService } from 'primeng/api';
import { contracts } from '../../../../RedicyApiClient';
import { ComponentBase } from '../../../service/component-base.component';
import { MultiSelectChangeEvent } from 'primeng/multiselect';
import { TimeService } from '../../../service/time.service';

class Order extends contracts.OzonSalesOrder {
    sum: number = 0;
    productCount: number = 0;
    status: contracts.PostingStatus[] = [];
    product: string[] = [];
    statuses: { status: contracts.PostingStatus, statusText: string, tag: string }[] = [];
    directions: { from: string, to: string[] }[] = [];
    postings: IPosting[];
    orderOperations: contracts.OzonOperation[];
    products: { productPackageID: string, quantity: number }[];
}

interface IPosting {
    postingNumber: string
    orderItems: contracts.OzonSalesOrderItem[];
    operations: contracts.OzonOperation[];
    status: contracts.PostingStatus;
    statusText: string;
    statusTag: string;
}

enum DateRangeType {
    ThisDay,
    PreviousDay,
    Day,
    ThisWeek,
    PreviousWeek,
    Week,
    ThisMonth,
    PreviousMonth,
    Month,
    Custom
}

interface IDateRangeOption {
    value: DateRangeType;
    name: string
}

@Component({
    selector: 'app-ozon-sales-order-list',
    templateUrl: './ozon-sales-order-list.component.html',
    styleUrls: ['./ozon-sales-order-list.component.css']
})
export class OzonSalesOrderListComponent extends ComponentBase {
    dateRangeType: DateRangeType = DateRangeType.ThisDay;
    dateRangeTypes = DateRangeType;
    customDateRange: Date[] | undefined;
    loading: boolean = false;
    productPackageIDs: string[] = [];
    data?: Order[];
    isLoading: boolean = false;
    findOrdersSubject = new BehaviorSubject<[Date, Date]>(null);
    dateRangeOptions: IDateRangeOption[] = [
        { name: 'Сегодня', value: DateRangeType.ThisDay },
        { name: 'Вчера', value: DateRangeType.PreviousDay },
        { name: 'Сутки', value: DateRangeType.Day },
        { name: 'Эта неделя', value: DateRangeType.ThisWeek },
        { name: 'Предыдущая неделя', value: DateRangeType.PreviousWeek },
        { name: 'Последняя неделя', value: DateRangeType.Week },
        { name: 'Этот месяц', value: DateRangeType.ThisMonth },
        { name: 'Предыдущий месяц', value: DateRangeType.PreviousMonth },
        { name: 'Последний месяц', value: DateRangeType.Month },
        { name: 'За период', value: DateRangeType.Custom }
    ];

    constructor(private _ozonClient: contracts.OzonClient, private messageService: MessageService, private timeService: TimeService) {
        super()
    }

    ngOnInit(): void {
        this.findOrdersSubject
            .pipe(takeUntil(this.destroyed), filter(item => !!item))
            .subscribe((range) => {
                this.findOrders(range[0], range[1]);
            })

        this.changeReportDate();
    }

    async changeReportDate(): Promise<void> {
        this.findOrdersSubject.next(this.getDateRange());
    }

    getSummary() {
        let finalizedSum = 0;
        let finalizedOrderCount = 0;
        let finalizedProductCount = 0;
        let finalizedSalesSum = 0;

        let totalSum = 0;
        let totalOrderCount = 0;
        let totalProductCount = 0;

        let returnSum = 0;
        let returnProductCount = 0;
        let paidReturnProductCount = 0;

        if (this.data) {
            for (const item of this.data) {
                let finalized = false;

                for (let orderItem of item.orderItems) {
                    let localSum;

                    if (orderItem.status == contracts.PostingStatus.Cancelled) {
                        finalized = true;

                        localSum = item.operations
                            .filter(operation => operation.postingNumber == orderItem.postingNumber)
                            .reduce((acc, operation) => acc + operation.amount, 0)
                            ;

                        paidReturnProductCount += (localSum != 0 ? orderItem.quantity : 0);
                        returnProductCount += orderItem.quantity;
                        returnSum += localSum;
                        finalizedSum += localSum;
                        finalizedSalesSum += orderItem.price;
                    } else {
                        localSum = item.operations
                            .filter(operation => operation.postingNumber == orderItem.postingNumber)
                            .reduce((acc, operation) => acc + operation.amount, 0)
                            ;

                        if (orderItem.status == contracts.PostingStatus.Delivered) {
                            finalized = true;

                            finalizedProductCount += orderItem.quantity;
                            finalizedSum += localSum;
                            finalizedSalesSum += orderItem.price;
                        }

                        totalProductCount += orderItem.quantity;
                    }

                    totalSum += orderItem.price;
                }

                const orderSum = item.operations
                    .filter(operation => operation.postingNumber == item.ozonOrderNumber)
                    .reduce((acc, operation) => acc + operation.amount, 0)
                    ;

                if (finalized) {
                    finalizedSum += orderSum;
                    finalizedOrderCount++;
                }

                totalOrderCount++;
            }
        }

        const expectedReturnCost = paidReturnProductCount == 0 ? 0 : returnSum / paidReturnProductCount
        const expectedReturnProductCount = finalizedProductCount == 0
            ? 0
            : (returnProductCount / finalizedProductCount * totalProductCount);

        const expectedPayout = (expectedReturnProductCount - returnProductCount) * expectedReturnCost
            + finalizedSum * totalSum / finalizedSalesSum;

        return {
            finalizedOrderCount: finalizedOrderCount,
            finalizedSum: finalizedSum,
            finalizedProductCount: finalizedProductCount,
            returnSum: returnSum,
            returnProductCount: returnProductCount,
            paidReturnProductCount: paidReturnProductCount,
            totalOrderCount: totalOrderCount,
            totalSum: totalSum,
            totalProductCount: totalProductCount,
            finalizedSalesSum: finalizedSalesSum,
            expectedPayout: expectedPayout,
        };
    }

    mapOrder(order: contracts.IOzonSalesOrder): Order {
        const postings: IPosting[] = [];


        const postingNumbers = new Set(order.orderItems.map(item => item.postingNumber));

        let productQuantities = order.orderItems
            .reduce((acc, item) => {
                acc[item.product.productPackageID] = (acc[item.product.productPackageID] ?? 0) + item.quantity;
                return acc;
            }, {})
        let products = Object.keys(productQuantities)
            .map((key) => ({
                productPackageID: key,
                quantity: productQuantities[key]
            }));

        for (const postingNumber of postingNumbers) {
            const orderItems = order.orderItems.filter(item => item.postingNumber == postingNumber);

            const posting: IPosting = {
                postingNumber: postingNumber,
                orderItems: orderItems,
                operations: order.operations.filter(item => item.postingNumber == postingNumber),
                status: orderItems[0].status,
                statusText: this.orderStatuses.find(item => item.status == orderItems[0].status)?.text,
                statusTag: this.getOrderStatusTag(orderItems[0].status)
            };

            postings.push(posting);
        }

        var result = <Order>order;
        result.products = products;
        result.orderOperations = result.operations.filter(item => item.postingNumber == result.ozonOrderNumber);
        result.sum = order.operations.reduce((acc, value) => acc + value.amount, 0);
        result.productCount = order.orderItems.reduce((acc, value) => acc + value.quantity, 0);
        result.statuses = this.getOrderStatuses(result);
        result.status = result.statuses.map(item => item.status);
        result.product = result.products.map(item => item.productPackageID);
        result.directions = this.getOrderDirections(result);
        result.postings = postings;

        return result;
    }

    orderStatuses = [
        { status: contracts.PostingStatus.AwaitingDeliver, text: 'Ожидание доставки' },
        { status: contracts.PostingStatus.Cancelled, text: 'Отменено' },
        { status: contracts.PostingStatus.AwaitingPackaging, text: 'Ожидание упаковки' },
        { status: contracts.PostingStatus.Delivering, text: 'Доставляется' },
        { status: contracts.PostingStatus.Delivered, text: 'Доставлено' },
    ]

    private getOrderStatuses(order: contracts.OzonSalesOrder): { status: contracts.PostingStatus, statusText: string, tag: string }[] {
        const statuses = [...new Set(order.orderItems.map(item => item.status))];

        let result = statuses

            .map(status => ({
                status: status,
                statusText: this.orderStatuses.find(item => item.status == status)?.text ?? order.toString(),
                tag: this.getOrderStatusTag(status)
            }));

        return result;
    }

    private getOrderStatusTag(status: contracts.PostingStatus): string {
        switch (status) {
            case contracts.PostingStatus.AwaitingDeliver:
                return 'warning';
            case contracts.PostingStatus.Cancelled:
                return 'danger';
            case contracts.PostingStatus.AwaitingPackaging:
                return 'warning';
            case contracts.PostingStatus.Delivering:
                return 'info';
            case contracts.PostingStatus.Delivered:
                return 'success';
        }

        throw new Error(`Unsupported Ozon order status ${status}`);
    }

    async importOrders() {
        const [dateFrom, dateTo] = this.getDateRange();
        const errorHandler = catchError(error => {
            this.messageService.add({
                summary: 'Ошибка',
                severity: 'error',
                detail: error
            });

            this.loading = false;
            return EMPTY;
        });

        await this._ozonClient.importOzonPostings(dateFrom!, dateTo!)
            .pipe(errorHandler)
            .pipe(switchMap(() => this._ozonClient.importTransactions(dateFrom, dateTo)))
            .pipe(errorHandler)
            .subscribe(() => {
                this.findOrdersSubject.next([dateFrom, dateTo]);
            })
    }

    private getDateRange(): [Date | null, Date | null] {
        var dateFrom = new Date();
        var dateTo: Date = null;

        switch (this.dateRangeType) {
            case DateRangeType.ThisDay:
                dateFrom.setHours(0, 0, 0, 0);
                break;
            case DateRangeType.PreviousDay:
                dateFrom.setDate(dateFrom.getDate() - 1);
                dateFrom.setHours(0, 0, 0, 0);
                dateTo = new Date(dateFrom);
                dateTo.setDate(dateTo.getDate() + 1);
                break;
            case DateRangeType.Day:
                dateFrom.setDate(dateFrom.getDate() - 1);
                break;
            case DateRangeType.ThisWeek:
                dateFrom.setDate(dateFrom.getDate() - (dateFrom.getDay() ? dateFrom.getDay() - 1 : 6));
                dateFrom.setHours(0, 0, 0, 0);
                break;
            case DateRangeType.PreviousWeek:
                dateTo = new Date(dateFrom);

                dateTo.setHours(0, 0, 0, 0);
                dateTo.setDate(dateTo.getDate() - (dateTo.getDay() ? dateTo.getDay() - 1 : 6));

                dateFrom = new Date(dateTo);
                dateFrom.setDate(dateFrom.getDate() - 7);

                break;
            case DateRangeType.Week:
                dateFrom.setDate(dateFrom.getDate() - 7);
                break;
            case DateRangeType.ThisMonth:
                dateFrom.setHours(0, 0, 0, 0);
                dateFrom.setDate(1);
                break;
            case DateRangeType.PreviousMonth:
                dateFrom.setHours(0, 0, 0, 0);
                dateFrom.setDate(1);
                dateTo = new Date(dateFrom);
                dateFrom.setMonth(dateFrom.getMonth() - 1);
                break;
            case DateRangeType.Month:
                dateFrom.setMonth(dateFrom.getMonth() - 1);
                break;
            default: 0
                dateFrom = this.customDateRange?.[0] == null ? null : new Date(this.customDateRange[0].getTime());
                dateTo = this.customDateRange?.[1] == null ? null : new Date(this.customDateRange[1].getTime());

                if (dateFrom != null) {
                }

                if (dateTo != null) {
                    dateTo.setDate(dateTo.getDate() + 1);
                }
                break;
        }

        const result: [Date, Date] = [this.timeService.asUtc(dateFrom), this.timeService.asUtc(dateTo)];

        return result;
    };

    getOrderDirections(order: contracts.OzonSalesOrder): { from: string, to: string[] }[] {
        return order.orderItems
            .reduce((acc, orderItem) => {
                const warehouseName = orderItem.ozonWarehouse?.name;
                const destination = [...new Set([orderItem.city, orderItem.region].filter(item => item))].join(', ')

                let warehouse = acc.find(item => item.from == warehouseName);
                if (!warehouse) {
                    warehouse = { from: warehouseName, to: [destination] };
                    acc.push(warehouse)
                } else if (!warehouse.to.find(item => item == destination)) {
                    warehouse.to.push(destination);
                }

                return acc;
            }, <{ from: string, to: string[] }[]>[]);
    }

    findOrders(dateFrom: Date, dateTo: Date) {
        var filter = {
            dateFrom: dateFrom ?? undefined,
            dateTo: dateTo ?? undefined,
            orderNumbers: []
        };
        const model = new contracts.FindPostingsModel(filter);

        this.loading = true;

        this._ozonClient.findOzonOrders(model)
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
                this.loading = false;
                this.data = result?.map(item => this.mapOrder(item));
                this.productPackageIDs = [...this.data?.
                    map(order => order.products)
                    .reduce((acc, product) => { product.forEach(item => { acc.add(item.productPackageID) }); return acc; }, new Set<string>())];
            });

    }

    getTransactionTypeText(type: contracts.TransactionType): string {
        return contracts.TransactionType[type];
    }

    getOperationTypeText(type: contracts.OperationType): string {
        return contracts.OperationType[type];
    }
}
