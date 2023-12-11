import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ProductImageEditorComponent } from './product-image-editor.component';



@NgModule({
    imports: [RouterModule.forChild([
        { path: 'editor', component: ProductImageEditorComponent },
        { path: '**', redirectTo: '/notfound' }
    ])],
    exports: [RouterModule]
})
export class ProductImageEditorRouterModule { }
