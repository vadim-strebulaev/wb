import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TokenStorageService {
    private readonly TOKEN_KEY = 'Auth.AccessToken'
    private readonly REFRESHTOKEN_KEY = 'Auth.RefreshToken'
    private readonly USER_KEY = 'Auth.UserData'
    private storage: Storage;

    public _loginSubject: BehaviorSubject<boolean>;

    constructor() {
        this.storage = localStorage;
        this._loginSubject = new BehaviorSubject<boolean>(!!this.storage.getItem(this.TOKEN_KEY))
    }

    get isLoggedIn(): boolean {
        return this._loginSubject.value;
    }

    signOut(): void {
        this._loginSubject.next(false);

        [this.TOKEN_KEY, this.REFRESHTOKEN_KEY, this.USER_KEY].forEach(item => this.storage.removeItem(item));
    }

    public saveToken(token: string): void {
        this.storage.setItem(this.TOKEN_KEY, token);

        const user = this.getUser();
        if (user.id) {
            this.saveUser({ ...user, accessToken: token });
        }

        this._loginSubject.next(true);
    }

    public getToken(): string | null {
        return this.storage.getItem(this.TOKEN_KEY);
    }

    public saveRefreshToken(token: string): void {
        this.storage.removeItem(this.REFRESHTOKEN_KEY);
        this.storage.setItem(this.REFRESHTOKEN_KEY, token);
    }

    public getRefreshToken(): string | null {
        return this.storage.getItem(this.REFRESHTOKEN_KEY);
    }

    public saveUser(user: any): void {
        this.storage.removeItem(this.USER_KEY);
        this.storage.setItem(this.USER_KEY, JSON.stringify(user));
    }

    public getUser(): any {
        const user = this.storage.getItem(this.USER_KEY);
        if (user) {
            return JSON.parse(user);
        }

        return {};
    }
}
