import { Component, OnInit, OnDestroy } from '@angular/core';
import { switchMap, takeUntil, timer } from 'rxjs';
import { DashboardService } from './dashboard.service';
import { contracts } from '../../../RedicyApiClient';
import { ComponentBase } from '../../service/component-base.component';

@Component({
    templateUrl: './dashboard.component.html',
})
export class DashboardComponent extends ComponentBase implements OnInit, OnDestroy {
    data: contracts.LatestSales;

    constructor(private dashboardService: DashboardService) {
        super();
    }

    ngOnInit() {
        timer(0, 30000).pipe(
            takeUntil(this.destroyed),
            switchMap(() => this.dashboardService.getLatestSalesInfo())
        )
            .subscribe(data => {
                this.data = data;
            })
            ;
    }
}
