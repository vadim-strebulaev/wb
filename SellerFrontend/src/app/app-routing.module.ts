import { RouterModule } from '@angular/router';
import { NgModule } from '@angular/core';
import { NotfoundComponent } from './seller/components/notfound/notfound.component';
import { AppLayoutComponent } from "./layout/app.layout.component";
import { authGuard } from './seller/components/auth/guards/auth.guard';

@NgModule({
    imports: [
        RouterModule.forRoot([
            {
                path: '', component: AppLayoutComponent,
                children: [
                    {
                        path: '',
                        canActivate: [authGuard],
                        loadChildren: () => import('./seller/components/dashboard/dashboard.module').then(m => m.DashboardModule)
                    },
                    {
                        path: 'ozon',
                        canActivate: [authGuard],
                        loadChildren: () => import('./seller/components/ozon/ozon.module').then(m => m.OzonModule)
                    },
                    {
                        path: 'product',
                        canActivate: [authGuard],
                        loadChildren: () => import('./seller/components/product/product.module')
                            .then(m => m.ProductModule)
                    },
                    {
                        path: 'purchase',
                        canActivate: [authGuard],
                        loadChildren: () => import('./seller/components/purchase/purchase.module')
                            .then(m => m.PurchaseModule)
                    },
                    { path: 'notfound', component: NotfoundComponent },
                ]
            },
            { path: 'auth', loadChildren: () => import('./seller/components/auth/auth.module').then(m => m.AuthModule) },
            { path: 'landing', loadChildren: () => import('./seller/components/landing/landing.module').then(m => m.LandingModule) },
            { path: '**', redirectTo: '/notfound' },
        ], { scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled', onSameUrlNavigation: 'reload' })
    ],
    exports: [RouterModule]
})
export class AppRoutingModule {
}
