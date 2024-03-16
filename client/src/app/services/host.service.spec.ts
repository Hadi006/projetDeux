import { TestBed } from '@angular/core/testing';
import { HostService } from '@app/services/host.service';
import { WebSocketService } from './web-socket.service';
import { SocketTestHelper } from '@app/test/socket-test-helper';
import { Socket } from 'socket.io-client';
import { TimeService } from './time.service';
import { Game } from '@common/game';
import { TEST_GAME_DATA, TEST_QUIZZES, TRANSITION_DELAY } from '@common/constant';
import { Quiz } from '@common/quiz';

class WebSocketServiceMock extends WebSocketService {
    override connect() {
        return;
    }
}

describe('HostService', () => {
    let testQuiz: Quiz;
    let testGame: Game;

    let service: HostService;
    let webSocketServiceMock: WebSocketServiceMock;
    let socketHelper: SocketTestHelper;
    let timeServiceSpy: jasmine.SpyObj<TimeService>;

    beforeEach(async () => {
        testQuiz = JSON.parse(JSON.stringify(TEST_QUIZZES[0]));
        testGame = JSON.parse(JSON.stringify(TEST_GAME_DATA));

        socketHelper = new SocketTestHelper();
        webSocketServiceMock = new WebSocketServiceMock();
        webSocketServiceMock['socket'] = socketHelper as unknown as Socket;
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['createTimerById', 'stopTimerById', 'startTimerById', 'setTimeById', 'getTimeById']);
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

    it('getTime should call getTimeById', () => {
        service.getTime();
        expect(timeServiceSpy.getTimeById).toHaveBeenCalledWith(1);
    });

    it('should connect to web socket', () => {
        spyOn(webSocketServiceMock, 'connect');
        service.handleSockets();
        expect(webSocketServiceMock.connect).toHaveBeenCalled();
    });

    it('should add player on playerJoined', (done) => {
        spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(testGame);
        });
        service.createGame(testQuiz).subscribe(() => {
            service.handleSockets();
            socketHelper.peerSideEmit('player-joined', { name: 'Test Player' });
            expect(service.game.players.length).toBe(testGame.players.length);
            done();
        });
    });

    it('should remove player on playerLeft and add to quitters', (done) => {
        spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(testGame);
        });
        service.createGame(testQuiz).subscribe(() => {
            service['currentQuestionIndex'] = 1;
            service.handleSockets();
            socketHelper.peerSideEmit('player-left', { players: testGame.players, player: testGame.players[0] });
            expect(service.game.players.length).toBe(testGame.players.length);
            expect(service.quitters).toContain(testGame.players[0]);
            done();
        });
    });

    it('should remove player on playerLeft and not add to quitters if no current question', (done) => {
        spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(testGame);
        });
        service.createGame(testQuiz).subscribe(() => {
            service.handleSockets();
            socketHelper.peerSideEmit('player-left', { players: testGame.players, player: testGame.players[0] });
            expect(service.game.players.length).toBe(testGame.players.length);
            expect(service.quitters).not.toContain(testGame.players[0]);
            done();
        });
    });

    it('should increment nAnswered on confirmPlayerAnswer', (done) => {
        spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(testGame);
        });
        service.createGame(testQuiz).subscribe(() => {
            service.handleSockets();
            socketHelper.peerSideEmit('confirm-player-answer');
            expect(service.nAnswered).toBe(1);
            done();
        });
    });

    it('should set timer to 0 and reset nAnswered if all players answered', (done) => {
        const emitSpy = spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(testGame);
        });
        service.createGame(testQuiz).subscribe(() => {
            emitSpy.and.stub();
            spyOn(service, 'endQuestion');
            service.handleSockets();
            socketHelper.peerSideEmit('confirm-player-answer');
            socketHelper.peerSideEmit('confirm-player-answer');
            expect(timeServiceSpy.setTimeById).toHaveBeenCalledWith(1, 0);
            expect(service.nAnswered).toBe(0);
            done();
        });
    });

    it('should create a game', (done) => {
        spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(testGame);
        });
        service.createGame(testQuiz).subscribe((success) => {
            expect(success).toBeTrue();
            done();
        });
    });

    it('should not create a game', (done) => {
        spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(null);
        });
        service.createGame(testQuiz).subscribe((success) => {
            expect(success).toBeFalse();
            done();
        });
    });

    it('should emit toggle-lock on toggleLock', (done) => {
        const emitSpy = spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(testGame);
        });
        service.createGame(testQuiz).subscribe(() => {
            emitSpy.and.stub();
            service.toggleLock();
            expect(emitSpy).toHaveBeenCalledWith('toggle-lock', { pin: service.game.pin, data: true });
            expect(service.game.locked).toBeTrue();
            done();
        });
    });

    it('should emit kick on kick', (done) => {
        const emitSpy = spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(testGame);
        });
        service.createGame(testQuiz).subscribe(() => {
            emitSpy.and.stub();
            service.kick('Test Player');
            expect(emitSpy).toHaveBeenCalledWith('kick', { pin: service.game.pin, data: 'Test Player' });
            done();
        });
    });

    it('should emit start-game on startGame', (done) => {
        const countdown = 10;
        const emitSpy = spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(testGame);
        });
        service.createGame(testQuiz).subscribe(() => {
            emitSpy.and.stub();
            service.startGame(countdown);
            expect(emitSpy).toHaveBeenCalledWith('start-game', { pin: service.game.pin, data: countdown });
            expect(timeServiceSpy.startTimerById).toHaveBeenCalledWith(1, countdown, jasmine.any(Function));
            done();
        });
    });

    it('should emit next-question on nextQuestion', () => {
        const emitSpy = spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(testGame);
        });
        service.createGame(testQuiz).subscribe(() => {
            emitSpy.and.stub();
            service.nextQuestion();
            expect(emitSpy).toHaveBeenCalledWith('next-question', {
                pin: service.game.pin,
                data: { question: service.game.quiz?.questions[0], countdown: service.game.quiz?.duration },
            });
            expect(timeServiceSpy.startTimerById).toHaveBeenCalledWith(1, TRANSITION_DELAY, jasmine.any(Function));
            expect(service.questionEnded).toBeFalse();
        });
    });

    it('should emit end-question, update-scores and answer on endQuestion', (done) => {
        const emitSpy = spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(testGame);
        });
        service.createGame(testQuiz).subscribe(() => {
            service.questionEndedSubject.subscribe(() => {
                expect(emitSpy).toHaveBeenCalledWith('end-question', service.game.pin);
                expect(emitSpy).toHaveBeenCalledWith(
                    'update-scores',
                    {
                        pin: service.game.pin,
                        data: -1,
                    },
                    jasmine.any(Function),
                );
                expect(emitSpy).toHaveBeenCalledWith('answer', {
                    pin: service.game.pin,
                    data: [],
                });
                expect(service.questionEnded).toBeTrue();
                done();
            });
            emitSpy.and.stub();
            service.endQuestion();
        });
    });

    it('should update game when updating scores', (done) => {
        spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(testGame);
        });
        service.createGame(testQuiz).subscribe(() => {
            service['emitUpdateScores']();
            expect(service.game).toEqual(testGame);
            done();
        });
    });

    it('should emit empty answer if no quiz', (done) => {
        const emitSpy = spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(testGame);
        });
        service.createGame(testQuiz).subscribe(() => {
            service.game.quiz = undefined;
            service.questionEndedSubject.subscribe(() => {
                expect(emitSpy).toHaveBeenCalledWith('answer', {
                    pin: service.game.pin,
                    data: [],
                });
                done();
            });

            emitSpy.and.stub();
            service.endQuestion();
        });
    });

    it('should emit end-game on endGame', (done) => {
        const emitSpy = spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(testGame);
        });
        service.createGame(testQuiz).subscribe(() => {
            service.gameEndedSubject.subscribe(() => {
                expect(emitSpy).toHaveBeenCalledWith('end-game', service.game.pin);
                done();
            });
            emitSpy.and.stub();
            service.endGame();
        });
    });

    it('should emit delete-game, disconnect and stop timer on cleanUp', () => {
        const emitSpy = spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(testGame);
        });
        service.createGame(testQuiz).subscribe(() => {
            emitSpy.and.stub();
            spyOn(webSocketServiceMock, 'disconnect');
            service.cleanUp();
            expect(emitSpy).toHaveBeenCalledWith('delete-game', service.game.pin);
            expect(webSocketServiceMock.disconnect).toHaveBeenCalled();
            expect(timeServiceSpy.stopTimerById).toHaveBeenCalledWith(1);
        });
    });

    it('should start timer when setting up next question', (done) => {
        const emitSpy = spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(testGame);
        });
        service.createGame(testQuiz).subscribe(() => {
            emitSpy.and.stub();
            service.nextQuestion();
            service['setupNextQuestion']();
            if (!testGame.quiz) {
                fail('No quiz');
                done();
                return;
            }
            expect(timeServiceSpy.startTimerById).toHaveBeenCalledWith(1, testGame.quiz.duration, jasmine.any(Function));
            done();
        });
    });

    it('should end game when setting up next question', (done) => {
        spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(testGame);
        });
        service.createGame(testQuiz).subscribe(() => {
            spyOn(service, 'endGame');
            service.game.quiz = JSON.parse(JSON.stringify({ ...testGame.quiz, questions: [] }));
            service['setupNextQuestion']();
            expect(service.endGame).toHaveBeenCalled();
            done();
        });
    });

    it('should do nothing when setting up next question', (done) => {
        spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(testGame);
        });
        service.createGame(testQuiz).subscribe(() => {
            spyOn(service, 'endGame');
            service.game.quiz = undefined;
            service['setupNextQuestion']();
            expect(service.endGame).not.toHaveBeenCalled();
            done();
        });
    });
});
