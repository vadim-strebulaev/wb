import { Injectable } from '@angular/core';
import { contracts } from '../../../../RedicyApiClient';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ProductService {

    constructor(private productService: contracts.ProductClient) { }

    findProducts(model: contracts.FindProductsModel): Observable<contracts.PagedResponseOfProduct> {
        return this.productService.findProducts(model)
    }

    findProductPackages(model: contracts.FindProductPackagesModel): Observable<contracts.PagedResponseOfProductPackage> {
        return this.productService.findProductPackages(model)
    }
}
