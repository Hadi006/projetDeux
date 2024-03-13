import { TestBed } from '@angular/core/testing';
import { HostService } from '@app/services/host.service';
import { WebSocketService } from './web-socket.service';
import { SocketTestHelper } from '@app/test/socket-test-helper';
import { Socket } from 'socket.io-client';
import { TimeService } from './time.service';
import { LobbyData } from '@common/lobby-data';
import { TEST_LOBBY_DATA, TEST_QUIZZES, TRANSITION_DELAY } from '@common/constant';
import { Quiz } from '@common/quiz';

class WebSocketServiceMock extends WebSocketService {
    override connect() {
        return;
    }
}

describe('HostService', () => {
    let testQuiz: Quiz;
    let testLobbyData: LobbyData;

    let service: HostService;
    let webSocketServiceMock: WebSocketServiceMock;
    let socketHelper: SocketTestHelper;
    let timeServiceSpy: jasmine.SpyObj<TimeService>;

    beforeEach(async () => {
        testQuiz = JSON.parse(JSON.stringify(TEST_QUIZZES[0]));
        testLobbyData = JSON.parse(JSON.stringify(TEST_LOBBY_DATA));

        socketHelper = new SocketTestHelper();
        webSocketServiceMock = new WebSocketServiceMock();
        webSocketServiceMock['socket'] = socketHelper as unknown as Socket;
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['createTimerById', 'stopTimerById', 'startTimerById']);
        timeServiceSpy.createTimerById.and.returnValue(1);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: WebSocketService, useValue: webSocketServiceMock },
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
            callback(testLobbyData);
        });
        service.createLobby(testQuiz).subscribe(() => {
            service.handleSockets();
            socketHelper.peerSideEmit('start-game', countdown);
            expect(service.lobbyData.locked).toBeTrue();
            expect(timeServiceSpy.startTimerById).toHaveBeenCalledWith(1, countdown, jasmine.any(Function));
            done();
        });
    });

    it('should start timer on nextQuestion', () => {
        const countdown = 10;
        service.handleSockets();
        socketHelper.peerSideEmit('next-question', countdown);
        expect(timeServiceSpy.startTimerById).toHaveBeenCalledWith(1, TRANSITION_DELAY, jasmine.any(Function));
    });

    it('should increment nAnswered on confirmPlayerAnswer', (done) => {
        spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(testLobbyData);
        });
        service.createLobby(testQuiz).subscribe(() => {
            service.handleSockets();
            socketHelper.peerSideEmit('confirm-player-answer');
            expect(service.nAnswered).toBe(1);
            done();
        });
    });

    it('should stop timer, emit endQuestion and reset nAnswered if all players answered', (done) => {
        const emitSpy = spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(testLobbyData);
        });
        service.createLobby(testQuiz).subscribe(() => {
            emitSpy.and.stub();
            spyOn(service, 'endQuestion');
            service.handleSockets();
            socketHelper.peerSideEmit('confirm-player-answer');
            socketHelper.peerSideEmit('confirm-player-answer');
            expect(timeServiceSpy.stopTimerById).toHaveBeenCalledWith(1);
            expect(service.endQuestion).toHaveBeenCalled();
            expect(service.nAnswered).toBe(0);
            done();
        });
    });

    it('should create a lobby', (done) => {
        spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(testLobbyData);
        });
        service.createLobby(testQuiz).subscribe((success) => {
            expect(success).toBeTrue();
            done();
        });
    });

    it('should not create a lobby', (done) => {
        spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(null);
        });
        service.createLobby(testQuiz).subscribe((success) => {
            expect(success).toBeFalse();
            done();
        });
    });

    it('should emit start-game on startGame', (done) => {
        const countdown = 10;
        const emitSpy = spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(testLobbyData);
        });
        service.createLobby(testQuiz).subscribe(() => {
            emitSpy.and.stub();
            service.startGame(countdown);
            expect(emitSpy).toHaveBeenCalledWith('start-game', { lobbyId: service.lobbyData.id, countdown });
            done();
        });
    });

    it('should emit next-question on nextQuestion', () => {
        const emitSpy = spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(testLobbyData);
        });
        service.createLobby(testQuiz).subscribe(() => {
            emitSpy.and.stub();
            service.nextQuestion();
            expect(emitSpy).toHaveBeenCalledWith('next-question', {
                lobbyId: service.lobbyData.id,
                question: service.lobbyData.quiz?.questions[0],
                countdown: service.lobbyData.quiz?.duration,
            });
        });
    });

    it('should emit end-question, update-scores and answer on endQuestion', (done) => {
        const emitSpy = spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(testLobbyData);
        });
        service.createLobby(testQuiz).subscribe(() => {
            emitSpy.and.stub();
            service.endQuestion();
            expect(emitSpy).toHaveBeenCalledWith('end-question', service.lobbyData.id);
            expect(emitSpy).toHaveBeenCalledWith('update-scores', {
                lobbyId: service.lobbyData.id,
                questionIndex: -1,
            });
            expect(emitSpy).toHaveBeenCalledWith('answer', {
                lobbyId: service.lobbyData.id,
                answer: [],
            });
            done();
        });
    });

    it('should emit end-game on endGame', (done) => {
        const emitSpy = spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(testLobbyData);
        });
        service.createLobby(testQuiz).subscribe(() => {
            service.gameEndedSubject.subscribe(() => {
                expect(emitSpy).toHaveBeenCalledWith('end-game', service.lobbyData.id);
                done();
            });
            emitSpy.and.stub();
            service.endGame();
        });
    });

    it('should emit delete-lobby, disconnect and stop timer on cleanUp', () => {
        const emitSpy = spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(testLobbyData);
        });
        service.createLobby(testQuiz).subscribe(() => {
            emitSpy.and.stub();
            spyOn(webSocketServiceMock, 'disconnect');
            service.cleanUp();
            expect(emitSpy).toHaveBeenCalledWith('delete-lobby', service.lobbyData.id);
            expect(webSocketServiceMock.disconnect).toHaveBeenCalled();
            expect(timeServiceSpy.stopTimerById).toHaveBeenCalledWith(1);
        });
    });

    it('should start timer when setting up next question', (done) => {
        const countdown = 10;
        spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(testLobbyData);
        });
        service.createLobby(testQuiz).subscribe(() => {
            service['setupNextQuestion'](countdown);
            expect(timeServiceSpy.startTimerById).toHaveBeenCalledWith(1, countdown, jasmine.any(Function));
            done();
        });
    });
});
