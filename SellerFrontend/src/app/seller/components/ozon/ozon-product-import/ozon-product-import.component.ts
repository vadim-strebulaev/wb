import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { EMPTY, catchError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { contracts } from '../../../../RedicyApiClient';

@Component({
    selector: 'app-ozon-product-import',
    templateUrl: './ozon-product-import.component.html',
    styleUrls: ['./ozon-product-import.component.css']
})
export class OzonProductImportComponent implements OnInit {
    constructor(private _ozonClient: contracts.OzonClient, private messageService: MessageService) {
    }

    ngOnInit(): void {
    }

    async importProducts(): Promise<void> {
        await this._ozonClient.importProducts()
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
                        detail: 'Загрузка товаров успешно завершена'
                    });
                }
            );
    }
}
