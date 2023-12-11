import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { gzip, ungzip } from 'pako';
import { AutoComplete, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { BehaviorSubject, EMPTY, Subject, catchError, switchMap, takeUntil } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ComponentBase } from '../../../service/component-base.component';
import { contracts } from '../../../../RedicyApiClient';
import { PurchaseService } from '../purchase.service';
import { Dropdown } from 'primeng/dropdown';

interface IDeliveryItem {
    productCount: number;
    price: number;
    count: number;
    name: string;
}

@Component({
    selector: 'app-purchase-editor',
    templateUrl: './purchase-editor.component.html',
    styleUrls: ['./purchase-editor.component.scss']
})
export class PurchaseEditorComponent extends ComponentBase {
    addedProduct: contracts.Product;
    encodedModel: string;
    shareLink: string;
    calculation: contracts.PurchaseBatch;
    productSearchSubject = new Subject<string>();
    purchaseBatchIDSubject = new Subject<number>();

    products: BehaviorSubject<contracts.Product[]> = new BehaviorSubject<contracts.Product[]>([]);
    salesChannels: BehaviorSubject<contracts.SalesChannel[]> = new BehaviorSubject<contracts.SalesChannel[]>([]);
    selectedProduct: contracts.Product;
    @ViewChild('productPackageDropdown') productPackageDropdown: Dropdown;
    @ViewChild('packageTypeDropdown') packageTypeDropdown: Dropdown;
    @ViewChild('salesChannelDropdown') salesChannelDropdown: Dropdown;
    @ViewChild('productAutocomplete') productAutocomplete: AutoComplete;

    constructor(private route: ActivatedRoute,
        private productClient: contracts.ProductClient,
        private packageTypeClient: contracts.PackageTypeClient,
        private purchaseBatchClient: contracts.PurchaseBatchClient,
        private salesChannelClient: contracts.SalesChannelClient,
        private messageService: MessageService,
        private purchaseService: PurchaseService) {
        super();
    }

    get duplicateProductDialogVisible(): boolean {
        return !!this.addedProduct;
    }

    set duplicateProductDialogVisible(value: boolean) {
        if (!value) {
            this.addedProduct = null;
        }
    }

    ngOnInit(): void {
        this.purchaseBatchIDSubject
            .pipe(takeUntil(this.destroyed))
            .pipe(switchMap(id => this.purchaseBatchClient.getPurchaseBatch(id)))
            .pipe(catchError(error => {
                this.messageService.add({
                    summary: 'Ошибка загрузки закупки',
                    severity: 'error',
                    detail: error
                })

                return EMPTY;
            }))
            .subscribe(response => {
                this.calculation = response;
            });

        this.productSearchSubject
            .pipe(takeUntil(this.destroyed))
            .pipe(switchMap(query => this.productClient.findProducts(new contracts.FindProductsModel({
                count: 10,
                offset: 0,
                productName: query
            })))
            )
            .pipe(catchError(error => {
                this.messageService.add({
                    summary: 'Ошибка поиска товаров',
                    severity: 'error',
                    detail: error
                })

                return EMPTY;
            }))
            .subscribe(response => {
                this.products.next(response.items);
            });

        this.salesChannelClient.getSalesChannels()
            .pipe(catchError(error => {
                this.messageService.add({
                    summary: 'Ошибка загрузки списка каналов продаж',
                    severity: 'error',
                    detail: error
                })

                return EMPTY;
            }))
            .subscribe(result => {
                this.salesChannels.next(result);
            });

        const id = +this.route.snapshot.paramMap.get('id');

        if (id > 0 && id != this.calculation?.iD) {
            this.purchaseBatchIDSubject.next(id);
        } else {
            this.calculation = new contracts.PurchaseBatch({
                date: new Date(),
                status: contracts.PurchaseBatchStatus.Unknown,
                items: [],
                name: 'Новая закупка',
                iD: 0
            });
        }
    }

    addSalesPlan(salesItem: contracts.SalesItem, salesChannel: contracts.SalesPlan): void {
        if (salesChannel) {
            if (!salesItem.salesPlans) {
                salesItem.salesPlans = [];
            }

            const productPackage = this.getSalesItemProductPackage(salesItem);
            const batchItem = this.getProductPackageBatchItem(productPackage);
            const salesPlan = new contracts.SalesPlan();
            salesPlan.salesChannel = salesChannel;
            salesPlan.salesChannelID = salesChannel.iD;
            salesPlan.amount = 0;
            salesPlan.status = contracts.SalesPlanStatus.InProcess;
            salesPlan.price = batchItem.price + salesItem.packagingPrice + this.getPackagePrice(salesItem);

            salesItem.salesPlans.push(salesPlan)

            this.salesChannelDropdown.clear(null);
        }
    }

    private createNewSalesItem(productPackage: contracts.ProductPackage, batchItem: contracts.PurchaseBatchItem): contracts.SalesItem {
        const salesItem = new contracts.SalesItem({
            packagingPrice: 0,
            volume: 0,
            salesItemPackages: [],
            salesPlans: [],
            iD: 0,
            name: 'стандартная упаковка',
            productPackageID: productPackage.iD,
            productPackage: productPackage,
            purchaseBatchItemID: batchItem.iD,
        });

        return salesItem;
    }

    getSalesItemProductPackage(salesItem: contracts.SalesItem): contracts.ProductPackage {
        const batchItem = this.getProductPackageBatchItem(salesItem.productPackage);
        const productPackage = batchItem.product.packages.find(item => item.iD == salesItem.productPackageID);

        return productPackage;

    }

    getProductPackageBatchItem(productPackage: contracts.ProductPackage): contracts.PurchaseBatchItem {
        const batchItem = this.calculation.items.find(item => item.productID == productPackage.productID);

        return batchItem;
    }

    addSalesItem(productPackage: contracts.ProductPackage) {
        if (productPackage) {
            const batchItem = this.getProductPackageBatchItem(productPackage);
            const salesItem = this.createNewSalesItem(productPackage, batchItem);

            batchItem.salesItems.push(salesItem);

            this.productPackageDropdown.clear(null);
        }
    }

    removeItem(list: any[], rowIndex: number): void {
        list.splice(rowIndex, 1);
    }

    getAvailablePackageTypes(salesItem: contracts.SalesItem): contracts.PackageType[] {
        const result: contracts.PackageType[] = [];

        const existingPackageTypeIDs = new Set(salesItem.salesItemPackages.map(item => item.packageTypeID));

        const packageTypes = this.purchaseService.getPackageTypes();
        for (const packageType of packageTypes) {
            if (!existingPackageTypeIDs.has(packageType.iD)) {
                result.push(packageType);
            }
        }

        return result;
    }

    addSalesItemPackage(salesItem: contracts.ISalesItem, packageType: contracts.PackageTypeWithPrice): void {
        if (packageType) {
            salesItem.salesItemPackages.push(new contracts.SalesItemPackage({
                packageTypeID: packageType.iD,
                amount: 0,
                pricePerUom: packageType.price ?? 0,
                salesItemID: salesItem.iD
            }));

            this.packageTypeDropdown.clear(null);
        }
    }

    getSelfCost(salesItem: contracts.SalesItem, salesPlan: contracts.SalesPlan, batchItem: contracts.PurchaseBatchItem): number {
        return this.purchaseService.getSalesPlanSelfCost(salesItem, salesPlan, batchItem);
    }

    getPackagePrice(salesItem: contracts.SalesItem): number {
        return this.purchaseService.getSalesItemCosts(salesItem);
    }

    getPackageType(id: number): contracts.PackageTypeWithPrice {
        return this.purchaseService.getPackageType(id);
    }

    unassignedProductCount(PurchaseBatch: contracts.IPurchaseBatch): {
        item: contracts.PurchaseBatchItem,
        format: contracts.SalesItem,
        assignedCount: number
    }[] {
        const assignedProducts = PurchaseBatch.items
            .flatMap(item => item.salesItems.map(format => ({
                item: item,
                format: format,
                assignedCount: format.salesPlans.reduce((acc, plan) => acc + plan.amount, 0)
            })))
            ;

        return assignedProducts;
    }

    findProductsByName(e: AutoCompleteCompleteEvent): void {
        const query = e.query.trim();

        if (query.length > 2) {
            this.productSearchSubject.next(e.query);
        }
    }

    addProduct(selectedProduct: contracts.Product): void {
        if (selectedProduct) {
            this.productAutocomplete.clear();

            const existingProduct = this.calculation.items.find(item => item.productID == selectedProduct.iD);
            this.selectedProduct = null;

            if (existingProduct) {
                this.addedProduct = selectedProduct;
            } else {
                this.calculation.items.push(new contracts.PurchaseBatchItem({
                    productID: selectedProduct.iD,
                    count: 0,
                    product: selectedProduct,
                    purchaseBatchID: this.calculation.iD,
                    price: 0,
                    salesItems: [],
                    iD: 0
                }))
            }
        }
    }

    savePurchaseBatch(): void {
        this.purchaseBatchClient.updatePurchaseBatch(this.calculation)
            .pipe(catchError((error) => {
                this.messageService.add({
                    summary: 'Ошибка',
                    severity: 'error',
                    detail: error
                })

                return EMPTY;
            }))
            .subscribe(
                result => {
                    this.calculation.iD = result.iD;

                    this.messageService.add({
                        summary: 'Успех',
                        severity: 'success',
                        detail: 'Сохранении партии успешно завершено'
                    });
                }
            );
    }

    get calculationTotalProductCount(): number {
        return this.calculation.items.reduce((acc, item) => Math.round(acc + item.count), 0);
    }

    get calculationTotalSum(): number {
        return this.calculation.items.reduce((acc, item) => Math.round(acc + item.price * item.count), 0);
    }

    getUnitOfMeasure(uom: contracts.UnitOfMeasure): string {
        let result: string;

        switch (uom) {
            case contracts.UnitOfMeasure.Piece:
                result = 'шт';
                break;
            case contracts.UnitOfMeasure.SquareMeter:
                result = 'м&sup2;'
                break
            default:
                result = ''
                break;
        }

        return result;
    }
}
