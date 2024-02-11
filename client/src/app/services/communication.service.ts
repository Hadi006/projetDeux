import { HttpClient, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Message } from '@common/message';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root',
})
export class CommunicationService {
    private readonly baseUrl: string = environment.serverUrl;

    constructor(private readonly http: HttpClient) {}

    basicGet(): Observable<Message> {
        return this.http.get<Message>(`${this.baseUrl}/example`).pipe(catchError(this.handleError<Message>('basicGet')));
    }

    basicPost(message: Message): Observable<HttpResponse<string>> {
        return this.http.post(`${this.baseUrl}/example/send`, message, { observe: 'response', responseType: 'text' });
    }

    get<T>(relativeUrl: string): Observable<HttpResponse<T>> {
        return this.http
            .get<T>(`${this.baseUrl}/${relativeUrl}`, { observe: 'response', responseType: 'json' })
            .pipe(catchError(this.handleErrorResponse<T>()));
    }

    post<T>(relativeUrl: string, body: object): Observable<HttpResponse<T>> {
        return this.http
            .post<T>(`${this.baseUrl}/${relativeUrl}`, body, { observe: 'response', responseType: 'json' })
            .pipe(catchError(this.handleErrorResponse<T>()));
    }

    patch<T>(relativeUrl: string, body: object = {}): Observable<HttpResponse<T>> {
        return this.http
            .patch<T>(`${this.baseUrl}/${relativeUrl}`, body, { observe: 'response', responseType: 'json' })
            .pipe(catchError(this.handleErrorResponse<T>()));
    }

    delete<T>(relativeUrl: string): Observable<HttpResponse<T>> {
        return this.http
            .delete<T>(`${this.baseUrl}/${relativeUrl}`, { observe: 'response', responseType: 'json' })
            .pipe(catchError(this.handleErrorResponse<T>()));
    }

    download(relativeUrl: string, baseUrl: string = this.baseUrl): Observable<Blob> {
        return this.http
            .get(`${baseUrl}/${relativeUrl}`, { observe: 'body', responseType: 'blob' })
            .pipe(catchError(this.handleError<Blob>(`download ${relativeUrl}`)));
    }

    private handleError<T>(request: string, result?: T): (error: Error) => Observable<T> {
        return () => of(result as T);
    }

    private handleErrorResponse<T>(): (error: HttpErrorResponse) => Observable<HttpResponse<T>> {
        return (error: HttpErrorResponse) => of(new HttpResponse<T>({ body: error.error as T, status: error.status, statusText: error.statusText }));
    }
}
