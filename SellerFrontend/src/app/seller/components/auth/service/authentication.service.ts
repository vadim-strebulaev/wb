import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { contracts } from '../../../../RedicyApiClient';

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {
    constructor(private tokenClient: contracts.TokenClient) {
    }

    login(login: string, password: string): Observable<contracts.JwtToken> {
        return this.tokenClient.generateToken(new contracts.LoginModel({
            login: login, password: password
        }));
    }

    refreshToken(token: string): Observable<contracts.JwtToken> {
        return this.tokenClient.refreshToken(token);
    }
}
