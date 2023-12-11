import { OnInit } from '@angular/core';
import { Component } from '@angular/core';
import { LayoutService } from './service/app.layout.service';

@Component({
    selector: 'app-menu',
    templateUrl: './app.menu.component.html'
})
export class AppMenuComponent implements OnInit {

    model: any[] = [];

    constructor(public layoutService: LayoutService) { }

    ngOnInit() {
        this.model = [
            {
                label: 'Селлер',
                items: [
                    { label: 'Обзор', icon: 'pi pi-fw pi-cog', routerLink: ['/'] },
                    { label: 'Заказы на Озон', icon: 'pi pi-fw pi-shopping-cart', routerLink: ['/ozon/salesOrders'] },
                    {
                        label: 'Редактор картинок',
                        icon: 'pi pi-fw pi-image',
                        routerLink: ['product', 'image-editor', 'editor']
                    },
                    {
                        label: 'Аниматор картинок',
                        icon: 'pi pi-fw pi-video',
                        routerLink: ['product', 'animator']
                    },
                    {
                        label: 'Товары',
                        icon: 'pi pi-fw pi-gift',
                        routerLink: ['product', 'list']
                    },
                    {
                        label: 'Закупки',
                        icon: 'pi pi-fw pi-percentage',
                        items: [
                            {
                                label: 'Редактор закупок',
                                icon: 'pi pi-fw pi-pencil',
                                routerLink: ['purchase', 'edit']
                            },
                            {
                                label: 'Список закупок',
                                icon: 'pi pi-fw pi-list',
                                routerLink: ['purchase']
                            },

                        ]
                    }
                ]
            },
            {
                label: 'Озон',
                items: [
                    {
                        label: 'Товары на Озон',
                        routerLink: ['/ozon/product']
                    },
                    {
                        label: 'Поставки на Озон',
                        routerLink: ['/ozon/supplyOrder']
                    },
                    {
                        label: 'Транзакции Озон',
                        routerLink: ['/ozon/transaction']
                    },
                    {
                        label: 'Сверка Озон',
                        routerLink: ['/ozon/reconciliation']
                    },
                    {
                        label: 'Импорт складов Озон',
                        icon: 'pi pi-fw pi-building',
                        routerLink: ['/ozon/import/warehouse']
                    },
                    {
                        label: 'Импорт отправлений',
                        routerLink: ['/ozon/import/posting']
                    },
                    {
                        label: 'Импорт товаров',
                        routerLink: ['/ozon/import/product']
                    },
                    {
                        label: 'Импорт остатков',
                        routerLink: ['/ozon/import/stocks']
                    },
                    {
                        label: 'Импорт транзакций',
                        routerLink: ['/ozon/import/transactions']
                    },
                    {
                        label: 'Импорт заявок на поставку',
                        routerLink: ['/ozon/import/supplyOrders']
                    },
                ]
                
            },
            {
                label: 'Вайлдберриз',
                items: [
                    {
                        label: 'Товары на вб',
                        routerLink: ['/wildberries/product']
                    }
                ]
                
            }
        ];
    }
}
