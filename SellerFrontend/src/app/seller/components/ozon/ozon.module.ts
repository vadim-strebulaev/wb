import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OzonRoutingModule } from './ozon-routing.module';
import { OzonWarehouseImportComponent } from './ozon-warehouse-import/ozon-warehouse-import.component';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { OzonPostingImportComponent } from './ozon-posting-import/ozon-posting-import.component';
import { CalendarModule } from 'primeng/calendar';
import { OzonProductImportComponent } from './ozon-product-import/ozon-product-import.component';
import { FormsModule } from '@angular/forms';
import { OzonStockImportComponent } from './ozon-stock-import/ozon-stock-import.component';
import { OzonSalesOrderListComponent } from './ozon-sales-order-list/ozon-sales-order-list.component';
import { SelectButtonModule } from 'primeng/selectbutton';
import { contracts } from '../../../RedicyApiClient';
import { MessageService } from 'primeng/api';
import { TableModule } from 'primeng/table';
import { MultiSelectModule } from 'primeng/multiselect';
import { TagModule } from 'primeng/tag';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ToastModule } from 'primeng/toast';
import { OzonTransactionImportComponent } from './ozon-transaction-import/ozon-transaction-import.component';
import { OzonSupplyOrderImportComponent } from './ozon-supply-order-import/ozon-supply-order-import.component';
import { OzonProductListComponent } from './ozon-product-list/ozon-product-list.component';
import { DialogModule } from 'primeng/dialog';
import { InputTextareaModule } from 'primeng/inputtextarea';
import { OzonSupplyOrderListComponent } from './ozon-supply-order-list/ozon-supply-order-list.component';
import { NgxBarcodeScannerModule, NgxBarcodeScannerService } from '@eisberg-labs/ngx-barcode-scanner';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { CheckboxModule } from 'primeng/checkbox';
import { OzonTransactionListComponent } from './ozon-transaction-list/ozon-transaction-list.component';
import { SalesReconciliationReportComponent } from './sales-reconciliation-report/sales-reconciliation-report.component';

@NgModule({
    imports: [
        CommonModule,
        OzonRoutingModule,
        CardModule,
        ButtonModule,
        CalendarModule,
        FormsModule,
        SelectButtonModule,
        TableModule,
        MultiSelectModule,
        DialogModule,
        TagModule,
        NgxBarcodeScannerModule,
        ClipboardModule,
        InputTextareaModule,
        InputNumberModule,
        InputTextModule,
        CheckboxModule,
        ToastModule
    ],
    declarations: [
        OzonWarehouseImportComponent,
        OzonPostingImportComponent,
        OzonProductImportComponent,
        OzonStockImportComponent,
        OzonSupplyOrderImportComponent,
        OzonSalesOrderListComponent,
        OzonTransactionImportComponent,
        OzonProductListComponent,
        OzonSupplyOrderListComponent,
        OzonTransactionListComponent,
        SalesReconciliationReportComponent 
    ],
    providers: [
        contracts.OzonClient,
        NgxBarcodeScannerService,
        MessageService
    ]
})
export class OzonModule { }
