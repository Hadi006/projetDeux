import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { PlayerService } from '@app/services/player/player.service';
import { TimeService } from '@app/services/time/time.service';
import { PlayerSocketService } from '@app/services/player-socket/player-socket.service';

describe('PlayerService', () => {
    let service: PlayerService;
    let playerSocketServiceSpy: jasmine.SpyObj<PlayerSocketService>;
    let timeServiceSpy: jasmine.SpyObj<TimeService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(async () => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['createTimerById', 'startTimerById', 'stopTimerById', 'setTimeById', 'getTimeById']);
        timeServiceSpy.createTimerById.and.returnValue(1);

        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
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
});
