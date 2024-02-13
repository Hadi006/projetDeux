import { HttpResponse, HttpStatusCode } from '@angular/common/http';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { AnswerValidatorService } from './answer-validator.service';
import { CommunicationService } from './communication.service';

describe('AnswerValidatorService', () => {
    let service: AnswerValidatorService;
    let communicationServiceSpy: jasmine.SpyObj<CommunicationService>;

    beforeEach(() => {
        communicationServiceSpy = jasmine.createSpyObj('CommunicationService', ['post']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [{ provide: CommunicationService, useValue: communicationServiceSpy }],
        });
        service = TestBed.inject(AnswerValidatorService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should validate an answer', () => {
        const text = '1234';
        const answer = [true, false, true, false];
        const expectedResponse = true;
        communicationServiceSpy.post.and.returnValue(of(new HttpResponse({ status: HttpStatusCode.Ok, body: expectedResponse })));

        service.validateAnswer(text, answer).subscribe((response) => {
            expect(communicationServiceSpy.post).toHaveBeenCalledWith('questions/validate-answer', { answer, text });
            expect(response).toBe(expectedResponse);
        });
    });

    it('should return false if the response status is not HttpStatusCode.Ok', () => {
        const text = '1234';
        const answer = [true, false, true, false];
        communicationServiceSpy.post.and.returnValue(of(new HttpResponse({ status: HttpStatusCode.NotFound })));

        service.validateAnswer(text, answer).subscribe((response) => {
            expect(communicationServiceSpy.post).toHaveBeenCalledWith('questions/validate-answer', { answer, text });
            expect(response).toBeFalse();
        });
    });

    it('should return false if the response body is falsy', () => {
        const text = '1234';
        const answer = [true, false, true, false];
        communicationServiceSpy.post.and.returnValue(of(new HttpResponse({ status: HttpStatusCode.Ok, body: null })));

        service.validateAnswer(text, answer).subscribe((response) => {
            expect(communicationServiceSpy.post).toHaveBeenCalledWith('questions/validate-answer', {answer, text});
            expect(response).toBeFalse();
        });
    });
});
