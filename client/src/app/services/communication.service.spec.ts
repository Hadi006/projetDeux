import { HttpResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { CommunicationService } from '@app/services/communication.service';
import { Message } from '@common/message';

interface TestInterface {
    id: number;
    name: string;
    isTrue: boolean;
    date: Date;
}

describe('CommunicationService', () => {
    let httpMock: HttpTestingController;
    let service: CommunicationService;
    let baseUrl: string;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
        });
        service = TestBed.inject(CommunicationService);
        httpMock = TestBed.inject(HttpTestingController);
        // eslint-disable-next-line dot-notation -- baseUrl is private and we need access for the test
        baseUrl = service['baseUrl'];
    });

    afterEach(() => {
        httpMock.verify();
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return expected message (HttpClient called once)', () => {
        const expectedMessage: Message = { body: 'Hello', title: 'World' };

        // check the content of the mocked call
        service.basicGet().subscribe({
            next: (response: Message) => {
                expect(response.title).toEqual(expectedMessage.title);
                expect(response.body).toEqual(expectedMessage.body);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/example`);
        expect(req.request.method).toBe('GET');
        // actually send the request
        req.flush(expectedMessage);
    });

    it('should not return any message when sending a POST request (HttpClient called once)', () => {
        const sentMessage: Message = { body: 'Hello', title: 'World' };
        // subscribe to the mocked call
        service.basicPost(sentMessage).subscribe({
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            next: () => {},
            error: fail,
        });
        const req = httpMock.expectOne(`${baseUrl}/example/send`);
        expect(req.request.method).toBe('POST');
        // actually send the request
        req.flush(sentMessage);
    });

    it('should handle http error safely', () => {
        service.basicGet().subscribe({
            next: (response: Message) => {
                expect(response).toBeUndefined();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/example`);
        expect(req.request.method).toBe('GET');
        req.error(new ProgressEvent('Random error occurred'));
    });

    it('should perform a GET request and return a typed response', () => {
        const expectedResponse: TestInterface = { id: 1, name: 'test', isTrue: true, date: new Date() };
        service.get<TestInterface>('test').subscribe({
            next: (response: HttpResponse<TestInterface>) => {
                expect(response.body).toEqual(expectedResponse);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/test`);
        expect(req.request.method).toBe('GET');
        req.flush(expectedResponse);
    });

    it('should return an HttpResponse with the error details for a GET request', () => {
        const body = { error: 'error message' };
        const status = 500;
        const statusText = 'Internal Server Error';

        service.get<TestInterface>('test').subscribe({
            next: (response: HttpResponse<TestInterface>) => {
                expect(response.body).toEqual(body as unknown as TestInterface);
                expect(response.status).toEqual(status);
                expect(response.statusText).toEqual(statusText);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/test`);
        req.flush(body, { status, statusText });
    });

    it('should perform a POST request and return a typed response', () => {
        const testData: TestInterface = { id: 1, name: 'test', isTrue: true, date: new Date() };
        const expectedResponse: TestInterface = { id: 2, name: 'test2', isTrue: false, date: new Date() };
        service.post<TestInterface>('test', testData).subscribe({
            next: (response: HttpResponse<TestInterface>) => {
                expect(response.body).toEqual(expectedResponse);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/test`);
        expect(req.request.method).toBe('POST');
        expect(req.request.body).toEqual(testData);
        req.flush(expectedResponse);
    });

    it('should return an HttpResponse with the error details for a POST request', () => {
        const body = { error: 'error message' };
        const status = 500;
        const statusText = 'Internal Server Error';

        service.post<TestInterface>('test', {}).subscribe({
            next: (response: HttpResponse<TestInterface>) => {
                expect(response.body).toEqual(body as unknown as TestInterface);
                expect(response.status).toEqual(status);
                expect(response.statusText).toEqual(statusText);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/test`);
        req.flush(body, { status, statusText });
    });

    it('should perform a PATCH request and return a typed response', () => {
        const testData: TestInterface = { id: 1, name: 'test', isTrue: true, date: new Date() };
        const expectedResponse: TestInterface = { id: 2, name: 'test2', isTrue: false, date: new Date() };
        service.patch<TestInterface>('test', testData).subscribe({
            next: (response: HttpResponse<TestInterface>) => {
                expect(response.body).toEqual(expectedResponse);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/test`);
        expect(req.request.method).toBe('PATCH');
        expect(req.request.body).toEqual(testData);
        req.flush(expectedResponse);
    });

    it('should return an HttpResponse with the error details for a PATCH request', () => {
        const body = { error: 'error message' };
        const status = 500;
        const statusText = 'Internal Server Error';

        service.patch<TestInterface>('test').subscribe({
            next: (response: HttpResponse<TestInterface>) => {
                expect(response.body).toEqual(body as unknown as TestInterface);
                expect(response.status).toEqual(status);
                expect(response.statusText).toEqual(statusText);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/test`);
        req.flush(body, { status, statusText });
    });

    it('should perform a DELETE request and return a typed response', () => {
        const expectedResponse: TestInterface = { id: 1, name: 'test', isTrue: true, date: new Date() };
        service.delete<TestInterface>('test').subscribe({
            next: (response: HttpResponse<TestInterface>) => {
                expect(response.body).toEqual(expectedResponse);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/test`);
        expect(req.request.method).toBe('DELETE');
        req.flush(expectedResponse);
    });

    it('should return an HttpResponse with the error details for a DELETE request', () => {
        const body = { error: 'error message' };
        const status = 500;
        const statusText = 'Internal Server Error';

        service.delete<TestInterface>('test').subscribe({
            next: (response: HttpResponse<TestInterface>) => {
                expect(response.body).toEqual(body as unknown as TestInterface);
                expect(response.status).toEqual(status);
                expect(response.statusText).toEqual(statusText);
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/test`);
        req.flush(body, { status, statusText });
    });

    it('should handle http error safely for a download request', () => {
        service.download('test').subscribe({
            next: (response: Blob) => {
                expect(response).toBeUndefined();
            },
            error: fail,
        });

        const req = httpMock.expectOne(`${baseUrl}/test`);
        expect(req.request.method).toBe('GET');
        req.error(new ProgressEvent('Random error occurred'));
    });
});
