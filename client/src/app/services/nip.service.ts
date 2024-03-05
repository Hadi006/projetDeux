import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class NipService {
    constructor(private http: HttpClient) {}

    checkAccessCodeValidity(accessCode: string): Observable<boolean> {
        return this.http.get<boolean>(`/api/check-access-code/${accessCode}`);
    }
}
