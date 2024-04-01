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
            'emitToggleLock',
            'emitKick',
        ]);
        playerJoinedSubject = new Subject<Player>();
        hostSocketServiceSpy.onPlayerJoined.and.returnValue(playerJoinedSubject);
        playerLeftSubject = new Subject<PlayerLeftEventData>();
        hostSocketServiceSpy.onPlayerLeft.and.returnValue(playerLeftSubject);
        confirmPlayerAnswerSubject = new Subject<void>();
        hostSocketServiceSpy.onConfirmPlayerAnswer.and.returnValue(confirmPlayerAnswerSubject);
        playerUpdatedSubject = new Subject<HistogramData>();
        hostSocketServiceSpy.onPlayerUpdated.and.returnValue(playerUpdatedSubject);
        hostSocketServiceSpy.emitCreateGame.and.returnValue(of(JSON.parse(JSON.stringify(TEST_GAME_DATA))));

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
            const player = JSON.parse(JSON.stringify(TEST_PLAYERS[0]));
            playerJoinedSubject.next(player);
            expect(service.game?.players).toContain(player);
            done();
        });
    });

    it('should remove player when player left', (done) => {
        service.handleSockets();
        service.createGame(TEST_QUIZZES[0]).subscribe(() => {
            const player = JSON.parse(JSON.stringify(TEST_PLAYERS[0]));
            playerLeftSubject.next({ player, players: [] });
            expect(service.game?.players).not.toContain(player);
            expect(service.quitters).toContain(player);
            done();
        });
    });

    it('should increment nAnswered when player answer is confirmed', (done) => {
        service.handleSockets();
        service.createGame(TEST_QUIZZES[0]).subscribe(() => {
            confirmPlayerAnswerSubject.next();
            expect(service.nAnswered).toBe(1);
            done();
        });
    });

    it('should update histograms when player is updated', (done) => {
        service.handleSockets();
        service.createGame(TEST_QUIZZES[0]).subscribe(() => {
            const histogram = JSON.parse(JSON.stringify(TEST_GAME_DATA.histograms[0]));
            service.histograms.push(histogram);
            playerUpdatedSubject.next(histogram);
            expect(service.histograms).toContain(histogram);
            done();
        });
    });

    it('should create game', (done) => {
        service.createGame(TEST_QUIZZES[0]).subscribe((result) => {
            expect(result).toBe(true);
            expect(service.game).toEqual(JSON.parse(JSON.stringify(TEST_GAME_DATA)));
            done();
        });
    });

    it('should not create game', (done) => {
        hostSocketServiceSpy.emitCreateGame.and.returnValue(of(undefined));
        service.createGame(TEST_QUIZZES[0]).subscribe((result) => {
            expect(result).toBe(false);
            expect(service.game).toBeNull();
            done();
        });
    });

    it('should lock game', (done) => {
        service.createGame(TEST_QUIZZES[0]).subscribe(() => {
            service.toggleLock();
            expect(service.game?.locked).toBe(true);

            if (!service.game) {
                fail();
                return;
            }

            expect(hostSocketServiceSpy.emitToggleLock).toHaveBeenCalledWith(service.game.pin, service.game.locked);
            done();
        });
    });

    it('should not lock game', () => {
        service.toggleLock();
        expect(hostSocketServiceSpy.emitToggleLock).not.toHaveBeenCalled();
    });

    it('should kick player', (done) => {
        service.createGame(TEST_QUIZZES[0]).subscribe(() => {
            service.kick('Player 1');

            if (!service.game) {
                fail();
                return;
            }

            expect(hostSocketServiceSpy.emitKick).toHaveBeenCalledWith(service.game.pin, 'Player 1');
            done();
        });
    });

    it('should not kick player', () => {
        service.kick('Player 1');
        expect(hostSocketServiceSpy.emitKick).not.toHaveBeenCalled();
    });
});
