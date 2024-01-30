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

    it('gradeNotifiers should return the correct value', () => {
        service['gradeNotifierSubjects'] = ANSWER_CONFIRMED_NOTIFIER_SUBJECTS;
        expect(service.gradeNotifiers).toEqual(ANSWER_CONFIRMED_NOTIFIER_SUBJECTS);
    });
});
