import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '@app/services/auth/auth.service';
import { UNAUTHORIZED_REDIRECT_URL } from '@common/constant';
import { catchError, map, Observable, of } from 'rxjs';
/**
 * @description This function is used to check if the user is authentificated before accessing the admin page
 * @returns true if the user is authentificated (already logged in), false otherwise
 */
export const authGuard = (): Observable<boolean> => {
    const AUTH_SERVICE: AuthService = inject(AuthService);
    const ROUTER: Router = inject(Router);

    return AUTH_SERVICE.checkAuthorization().pipe(
        map((authorized: boolean) => {
            if (!authorized) {
                ROUTER.navigate([UNAUTHORIZED_REDIRECT_URL]);
            }
            return authorized;
        }),
        catchError(() => {
            ROUTER.navigate([UNAUTHORIZED_REDIRECT_URL]);
            return of(false);
        }),
    );
};
