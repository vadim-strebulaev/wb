import { Component, OnInit } from '@angular/core';
import { EMPTY, catchError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { contracts } from '../../../../RedicyApiClient';

@Component({
    selector: 'app-ozon-sales-order-import',
    templateUrl: './ozon-supply-order-import.component.html',
    styleUrls: ['./ozon-supply-order-import.component.css']
})
export class OzonSupplyOrderImportComponent implements OnInit {
    customDateRange: [Date, Date] | undefined;

    constructor(private _ozonClient: contracts.OzonClient, private messageService: MessageService) {
    }

    ngOnInit(): void {
    }

    async importSupplyOrders(): Promise<void> {
        this._ozonClient.importOzonSupplyOrders()
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
                        detail: 'Загрузка поставок успешно завершена'
                    });
                }
            );
    }
}
