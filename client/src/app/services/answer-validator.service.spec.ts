import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

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
});
