import { TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';

import { PlayerHandlerService } from './player-handler.service';

const ANSWER_CONFIRMED_NOTIFIER_SUBJECTS = [new Subject<void>(), new Subject<void>(), new Subject<void>()];

describe('PlayerHandlerService', () => {
    let service: PlayerHandlerService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(PlayerHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('answerConfirmedNotifiers should return the correct value', () => {
        service['answerConfirmedNotifierSubjects'] = ANSWER_CONFIRMED_NOTIFIER_SUBJECTS;
        expect(service.answerConfirmedNotifiers).toEqual(ANSWER_CONFIRMED_NOTIFIER_SUBJECTS);
    });
});
