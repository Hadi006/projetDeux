import { TestBed } from '@angular/core/testing';
import { HostService } from '@app/services/host.service';
import { WebSocketService } from './web-socket.service';
import { SocketTestHelper } from '@app/test/socket-test-helper';
import { Socket } from 'socket.io-client';
import { TimeService } from './time.service';
import { QuestionHandlerService } from './question-handler.service';
import { Quiz } from '@common/quiz';
import { Player } from '@common/player';
import { LobbyData } from '@common/lobby-data';
import { TRANSITION_DELAY } from '@common/constant';

class WebSocketServiceMock extends WebSocketService {
    override connect() {
        return;
    }
}

describe('HostService', () => {
    const TEST_QUIZ: Quiz = {
        id: '1',
        title: 'Test Quiz',
        visible: true,
        description: 'Test Quiz Description',
        duration: 10,
        lastModification: new Date(),
        questions: [],
    };

    const TEST_PLAYERS: Player[] = [
        {
            name: 'Player 1',
            score: 0,
            questions: [],
            isCorrect: false,
        },
        {
            name: 'Player 2',
            score: 0,
            questions: [],
            isCorrect: false,
        },
    ];

    const TEST_LOBBY_DATA: LobbyData = {
        id: '1',
        players: [...TEST_PLAYERS],
        quiz: { ...TEST_QUIZ },
        locked: false,
    };

    let service: HostService;
    let webSocketServiceMock: WebSocketServiceMock;
    let socketHelper: SocketTestHelper;
    let questionHandlerServiceSpy: jasmine.SpyObj<QuestionHandlerService>;
    let timeServiceSpy: jasmine.SpyObj<TimeService>;

    beforeEach(async () => {
        socketHelper = new SocketTestHelper();
        webSocketServiceMock = new WebSocketServiceMock();
        webSocketServiceMock['socket'] = socketHelper as unknown as Socket;
        questionHandlerServiceSpy = jasmine.createSpyObj('QuestionHandlerService', ['getCurrentQuestion'], {
            questions: [],
        });
        questionHandlerServiceSpy.currentQuestionIndex = 0;
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['createTimerById', 'stopTimerById', 'startTimerById']);
        timeServiceSpy.createTimerById.and.returnValue(1);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: WebSocketService, useValue: webSocketServiceMock },
                { provide: QuestionHandlerService, useValue: questionHandlerServiceSpy },
                { provide: TimeService, useValue: timeServiceSpy },
            ],
        });
        service = TestBed.inject(HostService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create timer', () => {
        expect(timeServiceSpy.createTimerById).toHaveBeenCalled();
    });

    it('should connect to web socket', () => {
        spyOn(webSocketServiceMock, 'connect');
        service.handleSockets();
        expect(webSocketServiceMock.connect).toHaveBeenCalled();
    });

    it('should lock lobby and start timer on startGame', (done) => {
        const countdown = 10;
        spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback({ ...TEST_LOBBY_DATA });
        });
        service.createLobby(TEST_QUIZ).subscribe(() => {
            service.handleSockets();
            socketHelper.peerSideEmit('start-game', countdown);
            expect(service.lobbyData.locked).toBeTrue();
            expect(timeServiceSpy.startTimerById).toHaveBeenCalledWith(1, countdown, jasmine.any(Function));
            done();
        });
    });

    it('should increment currentQuestionIndex and start timer on nextQuestion', () => {
        const countdown = 10;
        service.handleSockets();
        socketHelper.peerSideEmit('next-question', countdown);
        expect(questionHandlerServiceSpy.currentQuestionIndex).toBe(1);
        expect(timeServiceSpy.startTimerById).toHaveBeenCalledWith(1, TRANSITION_DELAY, jasmine.any(Function));
    });

    it('should increment nAnswered on confirmPlayerAnswer', (done) => {
        spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback({ ...TEST_LOBBY_DATA });
        });
        service.createLobby(TEST_QUIZ).subscribe(() => {
            service.handleSockets();
            socketHelper.peerSideEmit('confirm-player-answer');
            expect(service.nAnswered).toBe(1);
            done();
        });
    });

    it('should stop timer, emit endQuestion and reset nAnswered if all players answered', (done) => {
        const emitSpy = spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback({ ...TEST_LOBBY_DATA });
        });
        service.createLobby(TEST_QUIZ).subscribe(() => {
            emitSpy.and.stub();
            service.handleSockets();
            socketHelper.peerSideEmit('confirm-player-answer');
            socketHelper.peerSideEmit('confirm-player-answer');
            expect(timeServiceSpy.stopTimerById).toHaveBeenCalledWith(1);
            expect(emitSpy).toHaveBeenCalledWith('end-question', TEST_LOBBY_DATA.id);
            expect(emitSpy).toHaveBeenCalledWith('update-scores', {
                lobbyId: TEST_LOBBY_DATA.id,
                questionIndex: questionHandlerServiceSpy.currentQuestionIndex - 1,
            });
            expect(service.nAnswered).toBe(0);
            done();
        });
    });

    it('should create a lobby', (done) => {
        spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback({ ...TEST_LOBBY_DATA });
        });
        service.createLobby(TEST_QUIZ).subscribe((success) => {
            expect(success).toBeTrue();
            done();
        });
    });

    it('should not create a lobby', (done) => {
        spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(null);
        });
        service.createLobby(TEST_QUIZ).subscribe((success) => {
            expect(success).toBeFalse();
            done();
        });
    });

    it('should emit start-game on startGame', (done) => {
        const countdown = 10;
        const emitSpy = spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback({ ...TEST_LOBBY_DATA });
        });
        service.createLobby(TEST_QUIZ).subscribe(() => {
            emitSpy.and.stub();
            service.startGame(countdown);
            expect(emitSpy).toHaveBeenCalledWith('start-game', { lobbyId: service.lobbyData.id, countdown });
            done();
        });
    });

    it('should emit next-question on nextQuestion', () => {
        const emitSpy = spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback({ ...TEST_LOBBY_DATA });
        });
        service.createLobby(TEST_QUIZ).subscribe(() => {
            emitSpy.and.stub();
            service.nextQuestion();
            expect(emitSpy).toHaveBeenCalledWith('next-question', {
                lobbyId: service.lobbyData.id,
                question: questionHandlerServiceSpy.getCurrentQuestion(),
                countdown: service.lobbyData.quiz?.duration,
            });
        });
    });

    it('should emit delete-lobby, disconnect and stop timer on cleanUp', () => {
        const emitSpy = spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback({ ...TEST_LOBBY_DATA });
        });
        service.createLobby(TEST_QUIZ).subscribe(() => {
            emitSpy.and.stub();
            spyOn(webSocketServiceMock, 'disconnect');
            service.cleanUp();
            expect(emitSpy).toHaveBeenCalledWith('delete-lobby', service.lobbyData.id);
            expect(webSocketServiceMock.disconnect).toHaveBeenCalled();
            expect(timeServiceSpy.stopTimerById).toHaveBeenCalledWith(1);
        });
    });

    it('should start timer when setting up next question', () => {
        const countdown = 10;
        service['setupNextQuestion'](countdown);
        expect(timeServiceSpy.startTimerById).toHaveBeenCalledWith(1, countdown, jasmine.any(Function));
    });
});
