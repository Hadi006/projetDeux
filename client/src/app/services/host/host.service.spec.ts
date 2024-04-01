import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { HostService } from '@app/services/host/host.service';
import { TimeService } from '@app/services/time/time.service';
import { HostSocketService } from '@app/services/host-socket/host-socket.service';
import { firstValueFrom, of, ReplaySubject, Subject } from 'rxjs';
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
            'emitStartGame',
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
        await firstValueFrom(service.createGame(TEST_QUIZZES[0]));
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
        service['reset']();
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

    it('should add player when player joined', () => {
        service.handleSockets();
        const player = JSON.parse(JSON.stringify(TEST_PLAYERS[0]));
        playerJoinedSubject.next(player);
        expect(service.game?.players).toContain(player);
    });

    it('should remove player when player left', () => {
        service.handleSockets();
        const player = JSON.parse(JSON.stringify(TEST_PLAYERS[0]));
        playerLeftSubject.next({ player, players: [] });
        expect(service.game?.players).not.toContain(player);
        expect(service.quitters).toContain(player);
    });

    it('should increment nAnswered when player answer is confirmed', () => {
        service.handleSockets();
        confirmPlayerAnswerSubject.next();
        expect(service.nAnswered).toBe(1);
    });

    it('should update histograms when player is updated', () => {
        service.handleSockets();
        const histogram = JSON.parse(JSON.stringify(TEST_GAME_DATA.histograms[0]));
        service.histograms.push(histogram);
        playerUpdatedSubject.next(histogram);
        expect(service.histograms).toContain(histogram);
    });

    it('should create game', (done) => {
        service['reset']();
        service.createGame(TEST_QUIZZES[0]).subscribe((result) => {
            expect(result).toBe(true);
            expect(service.game).toEqual(JSON.parse(JSON.stringify(TEST_GAME_DATA)));
            done();
        });
    });

    it('should not create game', (done) => {
        service['reset']();
        hostSocketServiceSpy.emitCreateGame.and.returnValue(of(undefined));
        service.createGame(TEST_QUIZZES[0]).subscribe((result) => {
            expect(result).toBe(false);
            expect(service.game).toBeNull();
            done();
        });
    });

    it('should lock game', () => {
        service.toggleLock();
        expect(service.game?.locked).toBe(true);

        if (!service.game) {
            fail();
            return;
        }

        expect(hostSocketServiceSpy.emitToggleLock).toHaveBeenCalledWith(service.game.pin, service.game.locked);
    });

    it('should not lock game', () => {
        service['reset']();
        service.toggleLock();
        expect(hostSocketServiceSpy.emitToggleLock).not.toHaveBeenCalled();
    });

    it('should kick player', () => {
        service.kick('Player 1');

        if (!service.game) {
            fail();
            return;
        }

        expect(hostSocketServiceSpy.emitKick).toHaveBeenCalledWith(service.game.pin, 'Player 1');
    });

    it('should not kick player', () => {
        service['reset']();
        service.kick('Player 1');
        expect(hostSocketServiceSpy.emitKick).not.toHaveBeenCalled();
    });

    it('should start game', () => {
        const countdown = 10;
        service.startGame(countdown);

        if (!service.game) {
            fail();
            return;
        }

        expect(hostSocketServiceSpy.emitStartGame).toHaveBeenCalledWith(service.game.pin, countdown);
    });

    it('should not start game', () => {
        service['reset']();
        service.startGame(1);
        expect(hostSocketServiceSpy.emitStartGame).not.toHaveBeenCalled();
    });
});
