import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { OzonWarehouseImportComponent } from './ozon-warehouse-import/ozon-warehouse-import.component';
import { OzonPostingImportComponent } from './ozon-posting-import/ozon-posting-import.component';
import { OzonProductImportComponent } from './ozon-product-import/ozon-product-import.component';
import { OzonStockImportComponent } from './ozon-stock-import/ozon-stock-import.component';
import { OzonSalesOrderListComponent } from './ozon-sales-order-list/ozon-sales-order-list.component';
import { OzonTransactionImportComponent } from './ozon-transaction-import/ozon-transaction-import.component';
import { OzonSupplyOrderImportComponent } from './ozon-supply-order-import/ozon-supply-order-import.component';
import { OzonProductListComponent } from './ozon-product-list/ozon-product-list.component';
import { OzonSupplyOrderListComponent } from './ozon-supply-order-list/ozon-supply-order-list.component';
import { OzonTransactionListComponent } from './ozon-transaction-list/ozon-transaction-list.component';
import { SalesReconciliationReportComponent } from './sales-reconciliation-report/sales-reconciliation-report.component';

@NgModule({
    imports: [RouterModule.forChild([
        { path: 'import/warehouse', component: OzonWarehouseImportComponent },
        { path: 'import/posting', component: OzonPostingImportComponent },
        { path: 'import/product', component: OzonProductImportComponent },
        { path: 'import/stocks', component: OzonStockImportComponent },
        { path: 'import/transactions', component: OzonTransactionImportComponent },
        { path: 'import/supplyOrders', component: OzonSupplyOrderImportComponent },
        { path: 'salesOrders', component: OzonSalesOrderListComponent },
        { path: 'product', component: OzonProductListComponent },
        { path: 'transaction', component: OzonTransactionListComponent },
        { path: 'supplyOrder', component: OzonSupplyOrderListComponent },
        { path: 'reconciliation', component: SalesReconciliationReportComponent },
    ])],
    exports: [RouterModule]
})
export class OzonRoutingModule { }
