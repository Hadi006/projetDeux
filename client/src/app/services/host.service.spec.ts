import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { HostService } from '@app/services/host.service';
import { Quiz } from '@common/quiz';
import { GameHandlerService } from '@app/services/game-handler.service';
import { LOBBY_ID_LENGTH, START_GAME_COUNTDOWN } from '@common/constant';
import { LobbyData } from '@common/lobby-data';
import { WebSocketService } from './web-socket.service';
import { Router } from '@angular/router';

describe('HostService', () => {
    const quizData: Quiz = {
        id: '0',
        title: 'Math',
        visible: true,
        description: 'Math quiz',
        duration: 5,
        lastModification: new Date(),
        questions: [],
    };
    const lobbyData: LobbyData = {
        id: '1234',
        players: [],
        started: false,
        quiz: quizData,
    };
    let service: HostService;
    let gameHandlerServiceSpy: jasmine.SpyObj<GameHandlerService>;
    let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
    let routerSpy: jasmine.SpyObj<Router>;

    beforeEach(() => {
        gameHandlerServiceSpy = jasmine.createSpyObj('GameHandlerService', ['cleanUp']);
        Object.defineProperty(gameHandlerServiceSpy, 'quizData', {
            get: () => quizData,
            configurable: true,
        });

        webSocketServiceSpy = jasmine.createSpyObj('GameSocketsService', ['connect', 'onEvent', 'emit', 'disconnect']);
        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: GameHandlerService, useValue: gameHandlerServiceSpy },
                { provide: WebSocketService, useValue: webSocketServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });
        service = TestBed.inject(HostService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create a lobby, connect the socket and call the create room method', (done) => {
        service.handleSockets();
        webSocketServiceSpy.emit.and.callFake((event, data, callback: (lobbyData: unknown) => void) => {
            callback(lobbyData as LobbyData);
        });
        service.createLobby().subscribe((result) => {
            expect(result).toBeTrue();
            expect(webSocketServiceSpy.connect).toHaveBeenCalled();
            expect(service.lobbyData.id.length).toEqual(LOBBY_ID_LENGTH);
            expect(service.lobbyData.quiz).toEqual(quizData);
            expect(webSocketServiceSpy.emit).toHaveBeenCalledWith('create-lobby', quizData, jasmine.any(Function));
            done();
        });
    });

    it('should not create a lobby if there is no quiz data', () => {
        Object.defineProperty(gameHandlerServiceSpy, 'quizData', {
            get: () => null,
            configurable: true,
        });
        service.createLobby().subscribe((result) => {
            expect(result).toBeFalse();
            expect(webSocketServiceSpy.connect).not.toHaveBeenCalled();
        });
    });

    it('should not create a lobby if creation was unsuccessful', () => {
        service.handleSockets();
        webSocketServiceSpy.emit.and.callFake((event, data, callback: (lobbyData: unknown) => void) => {
            callback(null);
        });
        service.createLobby().subscribe((result) => {
            expect(result).toBeFalse();
            expect(webSocketServiceSpy.connect).toHaveBeenCalled();
            expect(webSocketServiceSpy.emit).toHaveBeenCalledWith('create-lobby', quizData, jasmine.any(Function));
        });
    });

    it('should clean up the game socket', () => {
        webSocketServiceSpy.emit.and.callFake((event, data, callback: (lobbyData: unknown) => void) => {
            callback(lobbyData as LobbyData);
        });
        service.createLobby().subscribe(() => {
            webSocketServiceSpy.emit.and.callFake((event, data, callback: (lobbyData: unknown) => void) => {
                callback(null);
            });
            service.cleanUp();
            expect(webSocketServiceSpy.emit).toHaveBeenCalledWith('delete-lobby', service.lobbyData.id, jasmine.any(Function));
            expect(webSocketServiceSpy.disconnect).toHaveBeenCalled();
            expect(gameHandlerServiceSpy.cleanUp).toHaveBeenCalled();
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
        });
    });

    it('should emit a start countdown', () => {
        service.handleSockets();
        webSocketServiceSpy.emit.and.callFake((event, data, callback: (lobbyData: unknown) => void) => {
            callback(lobbyData as LobbyData);
        });
        service.createLobby().subscribe(() => {
            webSocketServiceSpy.emit.and.callFake(() => {
                return;
            });
            service.startCountdown(START_GAME_COUNTDOWN);
            expect(webSocketServiceSpy.emit).toHaveBeenCalledWith('start-countdown', { lobbyId: service.lobbyData.id, time: START_GAME_COUNTDOWN });
        });
    });

    it('should listen to the countdown event', (done) => {
        webSocketServiceSpy.onEvent.and.callFake((event, action) => {
            const countdownAction = action as (time: number) => void;
            countdownAction(START_GAME_COUNTDOWN);
        });
        webSocketServiceSpy.emit.and.callFake((event, data, callback: (lobbyData: unknown) => void) => {
            callback(lobbyData as LobbyData);
        });
        service.createLobby().subscribe(() => {
            service.handleSockets();
            webSocketServiceSpy.onEvent.calls.mostRecent().args[1](START_GAME_COUNTDOWN);
            expect(service.lobbyData.started).toBeTrue();
            expect(service.countdownTime).toEqual(START_GAME_COUNTDOWN);
            done();
        });
    });

    it('should emit a start game event', () => {
        webSocketServiceSpy.emit.and.callFake((event, data, callback: (lobbyData: unknown) => void) => {
            callback(lobbyData as LobbyData);
        });
        service.createLobby().subscribe(() => {
            webSocketServiceSpy.emit.and.callFake(() => {
                return;
            });
            service.startGame();
            expect(webSocketServiceSpy.emit).toHaveBeenCalledWith('start-game', service.lobbyData.id);
        });
    });

    it('should listen to the start game event', (done) => {
        webSocketServiceSpy.onEvent.and.callFake((event, action) => {
            const startGameAction = action as () => void;
            startGameAction();
        });
        webSocketServiceSpy.emit.and.callFake((event, data, callback: (lobbyData: unknown) => void) => {
            callback(lobbyData as LobbyData);
        });
        service.createLobby().subscribe(() => {
            service.handleSockets();
            webSocketServiceSpy.onEvent.calls.mostRecent().args[1](null);
            expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
            done();
        });
    });
});
