import { Component, OnInit } from '@angular/core';
import { ProductService } from './product.service';
import { contracts } from '../../../../RedicyApiClient';
import { LazyLoadEvent, MessageService } from 'primeng/api';
import { EMPTY, catchError, map, takeUntil } from 'rxjs';
import { ComponentBase } from '../../../service/component-base.component';

interface IProductColumn {
    header: string;
    field: string;
}
@Component({
  selector: 'app-product-list',
  templateUrl: './product-list.component.html',
  styleUrls: ['./product-list.component.scss']
})
export class ProductListComponent extends ComponentBase implements OnInit {
    totalRecords: number = 0;
    data: contracts.ProductPackage[];
    loading: boolean;

    constructor(private productService: ProductService, private messageService: MessageService) {
        super();
    }
    ngOnInit(): void {
        this.findProducts(new contracts.FindProductsModel({
            count: 0,
            offset: 0
        }));
    }

    findProducts(model: contracts.FindProductPackagesModel) {
        this.productService.findProductPackages(model)
            .pipe(takeUntil(this.destroyed))
            .pipe(catchError(error => {
                this.messageService.add({
                    summary: 'Ошибка',
                    severity: 'error',
                    detail: error
                })

                return EMPTY;
            }))
            .subscribe(data => {
                this.data = data.items;
                this.totalRecords = data.totalCount
            })
            ;
    }

    onDataLazyLoad(e: LazyLoadEvent) {
        const model = new contracts.FindProductsModel({
            offset: e.first,
            count: e.rows
        });

        this.findProducts(model);
    }
}
