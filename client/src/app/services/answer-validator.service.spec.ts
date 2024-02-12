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
        const questionId = '1234';
        const answer = [true, false, true, false];
        const expectedResponse = true;
        communicationServiceSpy.post.and.returnValue(of(new HttpResponse({ status: HttpStatusCode.Ok, body: expectedResponse })));

        service.validateAnswer(questionId, answer).subscribe((response) => {
            expect(communicationServiceSpy.post).toHaveBeenCalledWith(`/api/quiz/${questionId}/answer`, answer);
            expect(response).toBe(expectedResponse);
        });
    });
});
