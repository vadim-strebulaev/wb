import { TestBed } from '@angular/core/testing';

import { AuthenticationInterceptor } from './authentication-interceptor';

describe('AuthenticationInterceptor', () => {
    let service: AuthenticationInterceptor;

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: []
        });
        service = TestBed.inject(AuthenticationInterceptor);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
