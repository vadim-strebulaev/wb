import { NgModule, OnInit } from '@angular/core';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { AppLayoutModule } from './layout/app.layout.module';
import { NotfoundComponent } from './seller/components/notfound/notfound.component';
import { contracts } from './RedicyApiClient';
import { environment } from '../environments/environment';
import { MessageService } from 'primeng/api';
import { authInterceptorProviders } from './seller/components/auth/service/authentication-interceptor';
import { AuthenticationService } from './seller/components/auth/service/authentication.service';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TimeService } from './seller/service/time.service';

@NgModule({
    declarations: [
        AppComponent,
        NotfoundComponent,
    ],
    imports: [
        AppRoutingModule,
        AppLayoutModule,
        HttpClientModule
    ],
    providers: [
        {
            provide: contracts.REDICY_API_BASE_URL, useValue: environment.redicyApiUrl
        },
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        MessageService,
        HttpClient,
        contracts.TokenClient,
        AuthenticationService,
        authInterceptorProviders,
        TimeService,
    ],
    bootstrap: [AppComponent]
})
export class AppModule implements OnInit {
    ngOnInit(): void {
        console.log('init');
    }
}
