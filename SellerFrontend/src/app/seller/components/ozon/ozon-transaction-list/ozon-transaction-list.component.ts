import { Component } from '@angular/core';
import { contracts } from '../../../../RedicyApiClient';
import { ComponentBase } from '../../../service/component-base.component';
import { BehaviorSubject, EMPTY, catchError, filter, map, switchMap, takeUntil } from 'rxjs';
import { LazyLoadEvent, MessageService } from 'primeng/api';
import { TimeService } from '../../../service/time.service';

interface IFilteredData {
    items: contracts.OzonOperation[];
    totalCount: number;
    sum: number;
    commission: number;
    accrual: number;
}

@Component({
    selector: 'app-ozon-transaction-list',
    templateUrl: './ozon-transaction-list.component.html',
    styleUrls: ['./ozon-transaction-list.component.scss']
})
export class OzonTransactionListComponent extends ComponentBase {
    totalRecords: number;
    isLoading: boolean = false;
    dateRange: Date[] | undefined;
    serviceTypes: { type: contracts.OperationServiceType, text: string }[] = [];
    selectedServiceTypes: contracts.OperationServiceType[] = [];

    filteredData: BehaviorSubject<IFilteredData> = new BehaviorSubject<IFilteredData>(null);
    private dataSubject: BehaviorSubject<contracts.PagedResponseOfOzonOperations> = new BehaviorSubject<contracts.PagedResponseOfOzonOperations>(null);
    private filterSubject: BehaviorSubject<contracts.FindOzonOperationsModel> = new BehaviorSubject<contracts.FindOzonOperationsModel>(null);

    constructor(private ozonClient: contracts.OzonClient, private messageService: MessageService,
        private timeService: TimeService) {
        super();

        this.serviceTypes = Object.keys(contracts.OperationServiceType)
            .map(item => Number(item))
            .filter(item => !isNaN(item))
            .map(item => ({
                type: <contracts.OperationServiceType>Number(item),
                text: <string>contracts.OperationServiceType[item]
            }))
            .sort((left, right) => left.text > right.text ? 1 : (right.text > left.text ? -1 : 0))
            ;
    }

    override ngOnInit(): void {
        this.filterSubject
            .pipe(takeUntil(this.destroyed))
            .pipe(filter(item => !!item))
            .pipe(catchError(error => {
                this.messageService.add({
                    summary: 'Ошибка',
                    severity: 'error',
                    detail: error
                })

                return EMPTY;
            }))
            .pipe(switchMap(model => this.ozonClient.findOzonOperations(model)))
            .subscribe(data => {
                this.dataSubject.next(data);
            })

        this.dataSubject
            .pipe(takeUntil(this.destroyed))
            .pipe(filter(item => !!item))
            .pipe(catchError(error => {
                this.messageService.add({
                    summary: 'Ошибка',
                    severity: 'error',
                    detail: error
                })

                return EMPTY;
            }))
            .subscribe(_ => {
                this.filterData();
            })
            ;
    }

    filterData() {
        const data = this.dataSubject.value;
        const items: contracts.OzonOperation[] = [];
        let sum = 0;
        let accrual = 0;
        let commission = 0;

        if (data) {
            for (const item of data.items) {
                let matches = true;
                const operation = Object.assign({}, item);

                if (this.selectedServiceTypes.length) {
                    const matchingServices = operation.services.filter(service => this.selectedServiceTypes.find(type => type == service.type));

                    if (matchingServices.length) {
                        operation.services = matchingServices;
                    } else {
                        matches = false;
                    }
                }

                if (matches) {
                    items.push(operation);

                    accrual += operation.accrualsForSale;
                    commission += operation.saleCommission;
                    sum += operation.services.reduce((acc, service) => acc + service.price, 0) ?? 0;
                }
            }
        }
        const result: IFilteredData = ({
            totalCount: items.length,
            items: items,
            sum: sum,
            commission: commission,
            accrual: accrual,
        });

        this.filteredData.next(result);
    }

    async importTransactions(): Promise<void> {
        const [dateFrom, dateTo] = [this.timeService.asUtc(this.dateRange?.[0]), this.timeService.asUtc(this.dateRange?.[1])];
        this.ozonClient.importTransactions(dateFrom, dateTo)
            .pipe(catchError(error => {
                this.messageService.add({
                    summary: 'Ошибка',
                    severity: 'error',
                    detail: error
                });

                return EMPTY;
            }))
            .subscribe(
                () => {
                    this.messageService.add({
                        summary: 'Успех',
                        severity: 'success',
                        detail: 'Загрузка транзакций успешно завершена'
                    });
                }
            );
    }

    findTransactionsClick() {
        const model = new contracts.FindOzonOperationsModel({
            dateFrom: this.timeService.asUtc(this.dateRange?.[0]),
            dateTo: this.timeService.asUtc(this.dateRange?.[1]),
            offset: 0,
            count: 1000,
        });
        this.filterSubject.next(model);
    }

    getOperationServiceType(type: contracts.OperationServiceType): string {
        return contracts.OperationServiceType[type];
    }
}
