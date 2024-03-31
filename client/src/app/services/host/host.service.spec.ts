import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { HostService } from '@app/services/host/host.service';
import { TimeService } from '@app/services/time/time.service';
import { HostSocketService } from '@app/services/host-socket/host-socket.service';
import { ReplaySubject } from 'rxjs';

describe('HostService', () => {
    let service: HostService;
    let hostSocketServiceSpy: jasmine.SpyObj<HostSocketService>;
    let timeServiceSpy: jasmine.SpyObj<TimeService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let eventSubject: ReplaySubject<NavigationEnd>;

    beforeEach(async () => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['createTimerById', 'stopTimerById', 'startTimerById', 'setTimeById', 'getTimeById']);
        timeServiceSpy.createTimerById.and.returnValue(1);

        hostSocketServiceSpy = jasmine.createSpyObj('HostSocketService', ['disconnect']);

        eventSubject = new ReplaySubject();
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

    it("should verify if the route uses sockets and clean up if it doesn't", () => {
        Object.defineProperty(routerSpy, 'routerState', {
            get: () => ({
                snapshot: { root: { firstChild: { data: { usesSockets: false } } } },
            }),
        });
        spyOn(service, 'cleanUp');
        eventSubject.next(new NavigationEnd(1, 'url', 'url'));
        expect(service.cleanUp).toHaveBeenCalled();
    });

    it('should assign initial values', () => {
        expect(service.questionEndedSubject).toBeTruthy();
        expect(service.gameEndedSubject).toBeTruthy();
        expect(timeServiceSpy.createTimerById).toHaveBeenCalled();
        expect(service.game).toBeNull();
        expect(service.nAnswered).toBe(0);
        expect(service.questionEnded).toBe(false);
        expect(service.quitters).toEqual([]);
        expect(service.histograms).toEqual([]);
    });
});
