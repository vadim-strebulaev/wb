import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PurchaseRoutingModule } from './purchase-routing.module';
import { PurchaseListComponent } from './purchase-list/purchase-list.component';
import { TableModule } from 'primeng/table';
import { Toast, ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { contracts } from '../../../RedicyApiClient';
import { PurchaseSummaryComponent } from './purchase-summary/purchase-summary.component';
import { PurchaseEditorComponent } from './purchase-editor/purchase-editor.component';
import { CardModule } from 'primeng/card';
import { AccordionModule } from 'primeng/accordion';
import { TabViewModule } from 'primeng/tabview';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { PipesModule } from '../../pipes/pipes.module';
import { PurchaseService } from './purchase.service';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { DialogModule } from 'primeng/dialog';

@NgModule({
    declarations: [
        PurchaseListComponent,
        PurchaseEditorComponent,
        PurchaseSummaryComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        TableModule,
        ToastModule,
        ButtonModule,
        ToastModule,
        CardModule,
        AccordionModule,
        TabViewModule,
        InputTextModule,
        InputNumberModule,
        DropdownModule,
        DialogModule,
        PipesModule,
        AutoCompleteModule,
        PurchaseRoutingModule
    ],
    providers: [
        contracts.PurchaseBatchClient,
        contracts.ProductClient,
        contracts.PackageTypeClient,
        contracts.SalesChannelClient,
        PurchaseService
    ]
})
export class PurchaseModule { }
