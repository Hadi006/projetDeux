import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { AuthService, INVALID_TOKEN } from '@app/services/auth.service';
import { CommunicationService } from '@app/services/communication.service';
import { AccessToken } from '@common/access-token';
import { of, throwError } from 'rxjs';

describe('AuthService', () => {
    let service: AuthService;
    let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;
    let accessToken: AccessToken;

    beforeEach(() => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['post']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: CommunicationService, useValue: communicationServiceSpy }],
        });
        service = TestBed.inject(AuthService);
        accessToken = service['accessToken'];
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('checkAuthentication should call communicationService.post and return true with a valid token', () => {
        const password = 'password';
        const token: AccessToken = { id: 'id', expirationDate: 0 };
        const expectedResponse = new HttpResponse({ status: HttpStatusCode.Ok, body: { token } });
        communicationServiceSpy.post.and.returnValue(of(expectedResponse));
        service.checkAuthentication(password).subscribe({
            next: (response: boolean) => {
                expect(response).toBeTrue();
                expect(service['accessToken']).toEqual(token);
            },
            error: () => fail('Expected response to be true'),
        });
        expect(communicationServiceSpy.post).toHaveBeenCalledWith('auth/password', { password, token: accessToken });
    });

    it('checkAuthentication should call communicationService.post and return false with an invalid token', () => {
        const password = 'password';
        const expectedResponse = new HttpResponse({
            status: 401,
            statusText: 'Unauthorized',
        });

        communicationServiceSpy.post.and.returnValue(of(expectedResponse));
        service.checkAuthentication(password).subscribe({
            next: (response: boolean) => {
                expect(response).toBeFalse();
                expect(service['accessToken']).toEqual(INVALID_TOKEN);
            },
            error: () => fail('Expected response to be true'),
        });
        expect(communicationServiceSpy.post).toHaveBeenCalledWith('auth/password', { password, token: accessToken });
    });

    it('checkAuthentication should return false if an error occurs', () => {
        const password = 'password';
        communicationServiceSpy.post.and.returnValue(throwError(() => new Error('Test Error')));
        service.checkAuthentication(password).subscribe({
            next: (response: boolean) => expect(response).toBeFalse(),
            error: () => fail('Expected response to be false'),
        });
        expect(communicationServiceSpy.post).toHaveBeenCalledWith('auth/password', { password, token: accessToken });
    });

    it('checkAuthorization should call communicationService.post and return true if the token is valid and the http status is ok', () => {
        const expectedResponse = new HttpResponse({ status: HttpStatusCode.Ok, body: { authorized: true } });
        communicationServiceSpy.post.and.returnValue(of(expectedResponse));
        service.checkAuthorization().subscribe({
            next: (response: boolean) => expect(response).toBeTrue(),
            error: () => fail('Expected response to be true'),
        });
        expect(communicationServiceSpy.post).toHaveBeenCalledWith('auth/token', { token: accessToken });
    });

    it('checkAuthorization should call communicationService.post and return false if the token is invalid', () => {
        const expectedResponse = new HttpResponse({ status: HttpStatusCode.Ok, body: { authorized: false } });
        communicationServiceSpy.post.and.returnValue(of(expectedResponse));
        service.checkAuthorization().subscribe({
            next: (response: boolean) => expect(response).toBeFalse(),
            error: () => fail('Expected response to be false'),
        });
        expect(communicationServiceSpy.post).toHaveBeenCalledWith('auth/token', { token: accessToken });
    });

    it('checkAuthorization should return false if the http status is not ok', () => {
        const expectedResponse = new HttpResponse({
            body: { authorized: true },
            status: 401,
            statusText: 'Unauthorized',
        });
        communicationServiceSpy.post.and.returnValue(of(expectedResponse));
        service.checkAuthorization().subscribe({
            next: (response: boolean) => expect(response).toBeFalse(),
            error: () => fail('Expected response to be false'),
        });
        expect(communicationServiceSpy.post).toHaveBeenCalledWith('auth/token', { token: accessToken });
    });

    it('checkAuthorization should return false if an error occurs', () => {
        communicationServiceSpy.post.and.returnValue(throwError(() => new Error('Test Error')));
        service.checkAuthorization().subscribe({
            next: (response: boolean) => expect(response).toBeFalse(),
            error: () => fail('Expected response to be false'),
        });
        expect(communicationServiceSpy.post).toHaveBeenCalledWith('auth/token', { token: accessToken });
    });
});
