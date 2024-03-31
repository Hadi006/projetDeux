import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HostService } from '@app/services/host/host.service';
import { TimeService } from '@app/services/time/time.service';
import { HostSocketService } from '@app/services/host-socket/host-socket.service';
import { Subject } from 'rxjs';

describe('HostService', () => {
    let service: HostService;
    let hostSocketServiceSpy: jasmine.SpyObj<HostSocketService>;
    let timeServiceSpy: jasmine.SpyObj<TimeService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['createTimerById', 'stopTimerById', 'startTimerById', 'setTimeById', 'getTimeById']);
        timeServiceSpy.createTimerById.and.returnValue(1);

        const eventSubject = new Subject<void>();
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        Object.defineProperty(routerSpy, 'events', {
            get: () => {
                return eventSubject;
            },
            configurable: true,
        });
    });

    beforeEach(async () => {
        TestBed.configureTestingModule({
            providers: [
                { provide: HostSocketService, useValue: hostSocketServiceSpy },
                { provide: TimeService, useValue: timeServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });
        service = TestBed.inject(HostService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
