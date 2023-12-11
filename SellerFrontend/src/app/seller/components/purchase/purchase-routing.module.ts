import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PurchaseListComponent } from './purchase-list/purchase-list.component';
import { PurchaseEditorComponent } from './purchase-editor/purchase-editor.component';
import { PurchaseSummaryComponent } from './purchase-summary/purchase-summary.component';

const routes: Routes = [
    {
        path: 'edit',
        component: PurchaseEditorComponent
    },
    {
        path: '',
        component: PurchaseListComponent
    },
    {
        path: 'summary',
        component: PurchaseSummaryComponent
    }];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class PurchaseRoutingModule { }
