import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProductImageAnimatorComponent } from 'src/app/seller/components/product/product-image-animator/product-image-animator.component';

const routes: Routes = [
    {
        path: 'image-editor',
        loadChildren: () => import('src/app/seller/components/product/product-image-editor/product-image-editor.module')
            .then(m => m.ProductImageEditorModule)
    },
    {
        path: 'list',
        loadChildren: () => import('src/app/seller/components/product/product-list/product-list.module')
            .then(m => m.ProductListModule)
    },
    {
        path: 'animator',
        component: ProductImageAnimatorComponent,
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ProductRoutingModule { }
