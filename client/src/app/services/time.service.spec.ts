import { TestBed } from '@angular/core/testing';

import { TimeService } from './time.service';

describe('TimeService', () => {
    let service: TimeService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(TimeService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('createTimer should return a number', () => {
        expect(service.createTimer()).toEqual(jasmine.any(Number));
    });

    it('multiple calls to createTimer should return different Timers', () => {
        const timer1 = service.createTimer();
        const timer2 = service.createTimer();
        expect(timer1).not.toBe(timer2);
    });
});
