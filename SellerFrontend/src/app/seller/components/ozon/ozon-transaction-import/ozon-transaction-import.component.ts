import { Component, OnInit } from '@angular/core';
import { EMPTY, catchError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { contracts } from '../../../../RedicyApiClient';

@Component({
    selector: 'app-ozon-transaction-import',
    templateUrl: './ozon-transaction-import.component.html',
    styleUrls: ['./ozon-transaction-import.component.css']
})
export class OzonTransactionImportComponent implements OnInit {
    customDateRange: [Date, Date] | undefined;
    constructor(private _ozonClient: contracts.OzonClient, private messageService: MessageService) {
    }

    ngOnInit(): void {
    }

    async importTransactions(): Promise<void> {
        const [dateFrom, dateTo] = this.customDateRange ?? [null, null];
        this._ozonClient.importTransactions(dateFrom, dateTo)
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
}
