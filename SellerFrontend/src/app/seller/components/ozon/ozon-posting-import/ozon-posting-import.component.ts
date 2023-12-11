import { Component, OnInit } from '@angular/core';
import { EMPTY, catchError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { contracts } from '../../../../RedicyApiClient';

@Component({
    selector: 'app-ozon-posting-import',
    templateUrl: './ozon-posting-import.component.html',
    styleUrls: ['./ozon-posting-import.component.css']
})
export class OzonPostingImportComponent implements OnInit {
    customDateRange: [Date, Date] | undefined;

    constructor(private _ozonClient: contracts.OzonClient, private messageService: MessageService) {
    }

    ngOnInit(): void {
    }

    async importPostings(): Promise<void> {
        const [dateFrom, dateTo] = this.customDateRange ?? [null, null];
        this._ozonClient.importOzonPostings(dateFrom, dateTo)
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
                        detail: 'Загрузка отправлений успешно завершена'
                    });
                }
            );
    }
}
