import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DashboardComponent } from './dashboard.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DashboardsRoutingModule } from './dashboard-routing.module';
import { contracts } from '../../../RedicyApiClient';
import { DashboardService } from './dashboard.service';
import { SkeletonModule } from 'primeng/skeleton';

@NgModule({
    imports: [
        CommonModule,
        TableModule,
        ButtonModule,
        DashboardsRoutingModule,
        SkeletonModule
    ],
    declarations: [DashboardComponent],
    providers: [
        contracts.DashboardClient,
        DashboardService
    ]
})
export class DashboardModule { }
