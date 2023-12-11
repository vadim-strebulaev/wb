import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthRoutingModule } from './auth-routing.module';
import { contracts } from '../../../RedicyApiClient';
import { AuthenticationService } from './service/authentication.service';

@NgModule({
    imports: [
        CommonModule,
        AuthRoutingModule,
    ]
})
export class AuthModule { }
