import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { authGuard } from '@app/guards/auth.guard';
import { AuthService } from '@app/services/auth.service';
import { UNAUTHORIZED_REDIRECT_URL } from '@common/constant';
import { of, throwError } from 'rxjs';
describe('authGuard', () => {
    const executeGuard = () => TestBed.runInInjectionContext(() => authGuard());
    let authServiceSpy: jasmine.SpyObj<AuthService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        authServiceSpy = jasmine.createSpyObj('AuthService', ['checkAuthorization']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: AuthService, useValue: authServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });
    });

    it('should be created', () => {
        expect(executeGuard).toBeTruthy();
    });

    it('should return true if the user is authorized', (done) => {
        authServiceSpy.checkAuthorization.and.returnValue(of(true));

        executeGuard().subscribe((authorized) => {
            expect(authorized).toBeTrue();
            expect(routerSpy.navigate).not.toHaveBeenCalled();
            done();
        });
    });

    it('should return false if the user is not authorized', (done) => {
        authServiceSpy.checkAuthorization.and.returnValue(of(false));

        executeGuard().subscribe((authorized) => {
            expect(authorized).toBeFalse();
            expect(routerSpy.navigate).toHaveBeenCalledWith([UNAUTHORIZED_REDIRECT_URL]);
            done();
        });
    });

    it('should return false if the user is not authorized and an error occurs', (done) => {
        authServiceSpy.checkAuthorization.and.returnValue(throwError(() => new Error('Test Error')));

        executeGuard().subscribe((authorized) => {
            expect(authorized).toBeFalse();
            expect(routerSpy.navigate).toHaveBeenCalledWith([UNAUTHORIZED_REDIRECT_URL]);
            done();
        });
    });
});
