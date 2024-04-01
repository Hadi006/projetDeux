import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { PlayerService } from '@app/services/player/player.service';
import { TimeService } from '@app/services/time/time.service';
import { PlayerSocketService } from '@app/services/player-socket/player-socket.service';
import { ReplaySubject } from 'rxjs';

describe('PlayerService', () => {
    let service: PlayerService;
    let playerSocketServiceSpy: jasmine.SpyObj<PlayerSocketService>;
    let timeServiceSpy: jasmine.SpyObj<TimeService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let eventSubject: ReplaySubject<NavigationEnd>;

    beforeEach(async () => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['createTimerById', 'startTimerById', 'stopTimerById', 'setTimeById', 'getTimeById']);
        timeServiceSpy.createTimerById.and.returnValue(1);

        eventSubject = new ReplaySubject();
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
        Object.defineProperty(routerSpy, 'events', {
            get: () => {
                return eventSubject;
            },
            configurable: true,
        });
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: PlayerSocketService, useValue: playerSocketServiceSpy },
                { provide: TimeService, useValue: timeServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });
        service = TestBed.inject(PlayerService);
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
});
