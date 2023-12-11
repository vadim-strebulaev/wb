import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProductRoutingModule } from './product-routing.module';
import { ProductListComponent } from './product-list/product-list.component';
import { ProductService } from './product-list/product.service';
import { TableModule } from 'primeng/table';
import { contracts } from '../../../RedicyApiClient';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { ProductImageAnimatorComponent } from './product-image-animator/product-image-animator.component';
import { FileUploadModule } from 'primeng/fileupload';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormsModule } from '@angular/forms';
import { ProductProductPackageListComponent } from './product-product-package-list/product-product-package-list.component';


@NgModule({
    declarations: [
        ProductListComponent,
        ProductImageAnimatorComponent,
        ProductProductPackageListComponent
    ],
    imports: [
        FormsModule,
        CommonModule,
        ProductRoutingModule,
        TableModule,
        ToastModule,
        FileUploadModule,
        InputNumberModule,
        ButtonModule
    ],
    providers: [
        contracts.ProductClient,
        contracts.ImageToolClient,
        ProductService
    ]
})
export class ProductModule { }
