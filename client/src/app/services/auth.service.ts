import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AccessToken } from '@common/acesss-token';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CommunicationService } from './communication.service';

export const INVALID_TOKEN: AccessToken = { id: '', expirationDate: -1 };

@Injectable({
    providedIn: 'root',
})
export class AuthService {
    private accessToken: AccessToken = INVALID_TOKEN;

    constructor(private http: CommunicationService) {}

    checkAuthentification(password: string): Observable<boolean> {
        return this.http.post<{ token: AccessToken }>('auth/password', { password, token: this.accessToken }).pipe(
            map((response: HttpResponse<{ token: AccessToken }>) => {
                this.accessToken = response.body?.token || INVALID_TOKEN;

                return response.status === HttpStatusCode.Ok;
            }),
            catchError(() => of(false)),
        );
    }

    checkAuthorization(): Observable<boolean> {
        return this.http.post<{ authorized: boolean }>('auth/token', { token: this.accessToken }).pipe(
            map((response: HttpResponse<{ authorized: boolean }>) => {
                const AUTHORIZED = response.body?.authorized || false;

                return response.status === HttpStatusCode.Ok && AUTHORIZED;
            }),
            catchError(() => of(false)),
        );
    }
}
