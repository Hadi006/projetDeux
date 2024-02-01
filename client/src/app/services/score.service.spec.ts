import { TestBed } from '@angular/core/testing';

import { ScoreService } from '@app/services/score.service';
import { QuestionHandlerService } from '@app/services/question-handler.service';

describe('ScoreService', () => {
    let service: ScoreService;
    let questionHandlerServiceSpy: jasmine.SpyObj<QuestionHandlerService>;

    beforeEach(() => {
        questionHandlerServiceSpy = jasmine.createSpyObj<QuestionHandlerService>('QuestionHandlerService', [
            'questionsData',
            'currentQuestion',
        ]);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: QuestionHandlerService, useValue: questionHandlerServiceSpy }],
        });
        service = TestBed.inject(ScoreService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
