import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EMPTY, catchError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { contracts } from '../../../../RedicyApiClient';

@Component({
    selector: 'app-ozon-warehouse-import',
    templateUrl: './ozon-warehouse-import.component.html',
    styleUrls: ['./ozon-warehouse-import.component.css']
})
export class OzonWarehouseImportComponent implements OnInit {
    constructor(private _ozonClient: contracts.OzonClient, private messageService: MessageService) {
    }

    ngOnInit(): void {
    }

    async importWarehouses(): Promise<void> {
        this._ozonClient.importWarehouses()
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
