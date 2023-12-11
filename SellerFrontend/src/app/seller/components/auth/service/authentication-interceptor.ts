import { HTTP_INTERCEPTORS, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';

import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, map, switchMap, take } from 'rxjs/operators';
import { TokenStorageService } from './token-storage.service';
import { AuthenticationService } from './authentication.service';
import { contracts } from '../../../../RedicyApiClient';
import { Router } from '@angular/router';

const TOKEN_HEADER_KEY = 'Authorization';

@Injectable()
export class AuthenticationInterceptor implements HttpInterceptor {
    private isRefreshing = false;
    private accessTokenSubject: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor(private tokenService: TokenStorageService,
        private authService: AuthenticationService,
        private router: Router) {
    }

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<Object>> {
        let authReq = req;
        const token = this.tokenService.getToken();

        if (token != null) {
            authReq = this.addTokenHeader(req, token);
        } else {
            this.router.navigate(['auth', 'login']);
        }

        return next.handle(authReq).pipe(catchError(error => {
            if (error instanceof HttpErrorResponse && error.status === 401) {
                if (authReq.url.endsWith('/Token/login') || authReq.url.endsWith('/Token/refresh')) {
                    this.router.navigate(['auth', 'login']);
                } else {
                    return this.handle401Error(authReq, next);
                }
            }

            return throwError(() => error);
        }));
    }

    private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
        if (!this.isRefreshing) {
            this.isRefreshing = true;
            this.accessTokenSubject.next(null);

            const token = this.tokenService.getRefreshToken();

            if (!token) {
                this.router.navigate(['auth', 'login']);
            }

            return this.authService
                .refreshToken(token!)
                .pipe(catchError((err) => {
                    this.isRefreshing = false;

                    this.tokenService.signOut();

                    return throwError(() => err);
                }))
                .pipe(switchMap((token: contracts.JwtToken) => {
                    this.isRefreshing = false;

                    this.tokenService.saveToken(token.accessToken);
                    this.accessTokenSubject.next(token.accessToken);

                    return next.handle(this.addTokenHeader(request, token.accessToken));
                })
            );
        }

        return this.accessTokenSubject.pipe(
            filter(token => token !== null),
            take(1),
            switchMap((token) => next.handle(this.addTokenHeader(request, token)))
        );
    }

    private addTokenHeader(request: HttpRequest<any>, token: string) {
        return request.clone({ headers: request.headers.set(TOKEN_HEADER_KEY, 'Bearer ' + token) });
    }
}

export const authInterceptorProviders = [
    { provide: HTTP_INTERCEPTORS, useClass: AuthenticationInterceptor, multi: true }
];
