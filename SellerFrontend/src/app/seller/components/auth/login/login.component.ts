import { Component } from '@angular/core';
import { AuthenticationService } from '../service/authentication.service';
import { EMPTY, catchError, takeUntil, throwError } from 'rxjs';
import { MessageService } from 'primeng/api';
import { TokenStorageService } from '../service/token-storage.service';
import { ComponentBase } from '../../../service/component-base.component';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styles: [`
        :host ::ng-deep .pi-eye,
        :host ::ng-deep .pi-eye-slash {
            transform:scale(1.6);
            margin-right: 1rem;
            color: var(--primary-color) !important;
        }
    `]
})
export class LoginComponent extends ComponentBase {
    login!: string;
    password!: string;

    constructor(private authenticationService: AuthenticationService,
        private tokenStorageService: TokenStorageService,
        private messageService: MessageService,
        private router: Router,
    ) {
        super()
    }

    override ngOnInit(): void {
    }

    authenticate() {
        this.authenticationService
            .login(this.login, this.password)
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
                this.tokenStorageService.saveToken(data.accessToken);
                this.tokenStorageService.saveRefreshToken(data.refreshToken);
                this.tokenStorageService.saveUser(data);

                this.router.navigate(['/']);
            })
            ;
    }
}
