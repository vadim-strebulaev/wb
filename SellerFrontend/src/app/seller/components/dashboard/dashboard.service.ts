import { Injectable } from '@angular/core';
import { contracts } from '../../../RedicyApiClient';
import { EMPTY, Observable, catchError } from 'rxjs';
import { MessageService } from 'primeng/api';

@Injectable({
    providedIn: 'root'
})
export class DashboardService {

    constructor(private dashboardClient: contracts.DashboardClient, private messageService: MessageService) { }

    getLatestSalesInfo(): Observable<contracts.LatestSales> {
        return this.dashboardClient.getLatestSalesInfo()
            .pipe(catchError(error => {
                this.messageService.add({
                    summary: 'Ошибка',
                    severity: 'error',
                    detail: error
                })

                return EMPTY;
            })
            )
            ;
    }
}
