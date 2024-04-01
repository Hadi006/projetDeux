import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { HostService } from '@app/services/host/host.service';
import { TimeService } from '@app/services/time/time.service';
import { HostSocketService } from '@app/services/host-socket/host-socket.service';
import { of, ReplaySubject, Subject } from 'rxjs';
import { Player } from '@common/player';
import { PlayerLeftEventData } from '@common/player-left-event-data';
import { HistogramData } from '@common/histogram-data';
import { TEST_GAME_DATA, TEST_PLAYERS, TEST_QUIZZES } from '@common/constant';

describe('HostService', () => {
    let service: HostService;
    let hostSocketServiceSpy: jasmine.SpyObj<HostSocketService>;
    let timeServiceSpy: jasmine.SpyObj<TimeService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let eventSubject: ReplaySubject<NavigationEnd>;
    let playerJoinedSubject: Subject<Player>;
    let playerLeftSubject: Subject<PlayerLeftEventData>;
    let confirmPlayerAnswerSubject: Subject<void>;
    let playerUpdatedSubject: Subject<HistogramData>;

    beforeEach(async () => {
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['createTimerById', 'stopTimerById', 'startTimerById', 'setTimeById', 'getTimeById']);
        timeServiceSpy.createTimerById.and.returnValue(1);

        hostSocketServiceSpy = jasmine.createSpyObj('HostSocketService', [
            'isConnected',
            'connect',
            'disconnect',
            'onPlayerJoined',
            'onPlayerLeft',
            'onConfirmPlayerAnswer',
            'onPlayerUpdated',
            'emitCreateGame',
        ]);
        playerJoinedSubject = new Subject<Player>();
        hostSocketServiceSpy.onPlayerJoined.and.returnValue(playerJoinedSubject);
        playerLeftSubject = new Subject<PlayerLeftEventData>();
        hostSocketServiceSpy.onPlayerLeft.and.returnValue(playerLeftSubject);
        confirmPlayerAnswerSubject = new Subject<void>();
        hostSocketServiceSpy.onConfirmPlayerAnswer.and.returnValue(confirmPlayerAnswerSubject);
        playerUpdatedSubject = new Subject<HistogramData>();
        hostSocketServiceSpy.onPlayerUpdated.and.returnValue(playerUpdatedSubject);
        hostSocketServiceSpy.emitCreateGame.and.returnValue(of(TEST_GAME_DATA));

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

    it('should connect the socket if it isnt connected', () => {
        hostSocketServiceSpy.isConnected.and.returnValue(false);
        service.handleSockets();
        expect(hostSocketServiceSpy.connect).toHaveBeenCalled();
    });

    it('should add player when player joined', (done) => {
        service.handleSockets();
        service.createGame(TEST_QUIZZES[0]).subscribe(() => {
            hostSocketServiceSpy.onPlayerJoined().subscribe(() => {
                expect(service.game?.players).toContain(TEST_PLAYERS[0]);
                done();
            });
            playerJoinedSubject.next(TEST_PLAYERS[0]);
        });
    });

    it('should remove player when player left', (done) => {
        service.handleSockets();
        service.createGame(TEST_QUIZZES[0]).subscribe(() => {
            hostSocketServiceSpy.onPlayerLeft().subscribe(() => {
                expect(service.game?.players).not.toContain(TEST_PLAYERS[0]);
                expect(service.quitters).toContain(TEST_PLAYERS[0]);
                done();
            });
            playerLeftSubject.next({ player: TEST_PLAYERS[0], players: [] });
        });
    });
});
