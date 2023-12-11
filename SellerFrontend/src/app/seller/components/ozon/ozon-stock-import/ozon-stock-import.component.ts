import { Component, OnInit } from '@angular/core';
import { EMPTY, catchError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { contracts } from '../../../../RedicyApiClient';

@Component({
    selector: 'app-ozon-stock-import',
    templateUrl: './ozon-stock-import.component.html',
    styleUrls: ['./ozon-stock-import.component.css']
})
export class OzonStockImportComponent implements OnInit {
    constructor(private _ozonClient: contracts.OzonClient, private messageService: MessageService) {
    }

    ngOnInit(): void {
    }

    async updateStocks(): Promise<void> {
        this._ozonClient.importProductStocks()
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
                        detail: 'Загрузка складов Озон успешно завершена'
                    });
                }
            );
    }
}
