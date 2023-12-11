import { CanActivateFn, Router } from '@angular/router';
import { TokenStorageService } from '../service/token-storage.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = () => {
    const tokenStorageService: TokenStorageService = inject(TokenStorageService);
    const router: Router = inject(Router);

    return tokenStorageService.isLoggedIn || router.createUrlTree(['auth', 'login']);
}
