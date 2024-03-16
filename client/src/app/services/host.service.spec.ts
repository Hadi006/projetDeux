import { TestBed } from '@angular/core/testing';
import { HostService } from '@app/services/host.service';
import { WebSocketService } from './web-socket.service';
import { SocketTestHelper } from '@app/test/socket-test-helper';
import { Socket } from 'socket.io-client';
import { TimeService } from './time.service';
import { Game } from '@common/game';
import { TEST_GAME_DATA, TEST_QUIZZES, TRANSITION_DELAY } from '@common/constant';
import { Quiz } from '@common/quiz';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';

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
    let routerSpy: jasmine.SpyObj<Router>;
    let emitSpy: jasmine.Spy;

    beforeEach(async () => {
        testQuiz = JSON.parse(JSON.stringify(TEST_QUIZZES[0]));
        testGame = JSON.parse(JSON.stringify(TEST_GAME_DATA));

        socketHelper = new SocketTestHelper();
        webSocketServiceMock = new WebSocketServiceMock();
        webSocketServiceMock['socket'] = socketHelper as unknown as Socket;
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['createTimerById', 'stopTimerById', 'startTimerById', 'setTimeById', 'getTimeById']);
        timeServiceSpy.createTimerById.and.returnValue(1);

        routerSpy = jasmine.createSpyObj('Router', ['navigate']);
    });

    beforeEach(async () => {
        TestBed.configureTestingModule({
            providers: [
                { provide: WebSocketService, useValue: webSocketServiceMock },
                { provide: TimeService, useValue: timeServiceSpy },
                { provide: Router, useValue: routerSpy },
            ],
        });
        service = TestBed.inject(HostService);
        emitSpy = spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(testGame);
        });
        await firstValueFrom(service.createGame(testQuiz));
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

    it('should add player on playerJoined', () => {
        service.handleSockets();
        socketHelper.peerSideEmit('player-joined', { name: 'Test Player' });
        expect(service.game.players.length).toBe(testGame.players.length);
    });

    it('should remove player on playerLeft and add to quitters', () => {
        service['currentQuestionIndex'] = 1;
        service.handleSockets();
        socketHelper.peerSideEmit('player-left', { players: testGame.players, player: testGame.players[0] });
        expect(service.game.players.length).toBe(testGame.players.length);
        expect(service.quitters).toContain(testGame.players[0]);
    });

    it('should remove player on playerLeft and not add to quitters if no current question', () => {
        service.handleSockets();
        socketHelper.peerSideEmit('player-left', { players: testGame.players, player: testGame.players[0] });
        expect(service.game.players.length).toBe(testGame.players.length);
        expect(service.quitters).not.toContain(testGame.players[0]);
    });

    it('should end game if all players left', () => {
        service['currentQuestionIndex'] = 1;
        spyOn(service, 'endGame');
        service.handleSockets();
        socketHelper.peerSideEmit('player-left', { players: [], player: testGame.players[0] });
        expect(service.endGame).toHaveBeenCalled();
    });

    it('should increment nAnswered on confirmPlayerAnswer', () => {
        service.handleSockets();
        socketHelper.peerSideEmit('confirm-player-answer');
        expect(service.nAnswered).toBe(1);
    });

    it('should set timer to 0 and reset nAnswered if all players answered', () => {
        emitSpy.and.stub();
        spyOn(service, 'endQuestion');
        service.handleSockets();
        socketHelper.peerSideEmit('confirm-player-answer');
        socketHelper.peerSideEmit('confirm-player-answer');
        expect(timeServiceSpy.setTimeById).toHaveBeenCalledWith(1, 0);
        expect(service.nAnswered).toBe(0);
    });

    it('should create a game', (done) => {
        service.createGame(testQuiz).subscribe((success) => {
            expect(success).toBeTrue();
            done();
        });
    });

    it('should not create a game', (done) => {
        emitSpy.and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(null);
        });
        service.createGame(testQuiz).subscribe((success) => {
            expect(success).toBeFalse();
            done();
        });
    });

    it('should emit delete-game and cleanup on leaveGame', () => {
        emitSpy.and.stub();
        spyOn(service, 'cleanUp');
        service.leaveGame();
        expect(emitSpy).toHaveBeenCalledWith('delete-game', service.game.pin);
        expect(service.cleanUp).toHaveBeenCalled();
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
    });

    it('should emit toggle-lock on toggleLock', () => {
        emitSpy.and.stub();
        service.toggleLock();
        expect(emitSpy).toHaveBeenCalledWith('toggle-lock', { pin: service.game.pin, data: true });
        expect(service.game.locked).toBeTrue();
    });

    it('should emit kick on kick', () => {
        emitSpy.and.stub();
        service.kick('Test Player');
        expect(emitSpy).toHaveBeenCalledWith('kick', { pin: service.game.pin, data: 'Test Player' });
    });

    it('should emit start-game on startGame', () => {
        const countdown = 10;
        emitSpy.and.stub();
        service.startGame(countdown);
        expect(emitSpy).toHaveBeenCalledWith('start-game', { pin: service.game.pin, data: countdown });
        expect(timeServiceSpy.startTimerById).toHaveBeenCalledWith(1, countdown, jasmine.any(Function));
    });

    it('should emit next-question on nextQuestion', () => {
        emitSpy.and.stub();
        service.nextQuestion();
        expect(emitSpy).toHaveBeenCalledWith('next-question', {
            pin: service.game.pin,
            data: { question: service.game.quiz?.questions[0], countdown: service.game.quiz?.duration },
        });
        expect(timeServiceSpy.startTimerById).toHaveBeenCalledWith(1, TRANSITION_DELAY, jasmine.any(Function));
        expect(service.questionEnded).toBeFalse();
    });

    it('should emit end-question, update-scores and answer on endQuestion', () => {
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
        });
        emitSpy.and.stub();
        service.endQuestion();
        service.questionEndedSubject.next();
    });

    it('should update game when updating scores', () => {
        service['emitUpdateScores']();
        expect(service.game).toEqual(testGame);
    });

    it('should emit empty answer if no quiz', () => {
        service.game.quiz = undefined;
        service.questionEndedSubject.subscribe(() => {
            expect(emitSpy).toHaveBeenCalledWith('answer', {
                pin: service.game.pin,
                data: [],
            });
        });
        emitSpy.and.stub();
        service.endQuestion();
        service.questionEndedSubject.next();
    });

    it('should emit end-game on endGame', () => {
        service.gameEndedSubject.subscribe(() => {
            expect(emitSpy).toHaveBeenCalledWith('end-game', service.game.pin);
        });
        emitSpy.and.stub();
        service.endGame();
        service.gameEndedSubject.next();
    });

    it('should emit delete-game, disconnect and stop timer on cleanUp', () => {
        emitSpy.and.stub();
        spyOn(webSocketServiceMock, 'disconnect');
        service.cleanUp();
        expect(emitSpy).toHaveBeenCalledWith('delete-game', service.game.pin);
        expect(webSocketServiceMock.disconnect).toHaveBeenCalled();
        expect(timeServiceSpy.stopTimerById).toHaveBeenCalledWith(1);
    });

    it('should start timer when setting up next question', () => {
        emitSpy.and.stub();
        service.nextQuestion();
        service['setupNextQuestion']();
        if (!testGame.quiz) {
            fail('No quiz');
            return;
        }
        expect(timeServiceSpy.startTimerById).toHaveBeenCalledWith(1, testGame.quiz.duration, jasmine.any(Function));
    });

    it('should end game when setting up next question', () => {
        spyOn(service, 'endGame');
        service.game.quiz = JSON.parse(JSON.stringify({ ...testGame.quiz, questions: [] }));
        service['setupNextQuestion']();
        expect(service.endGame).toHaveBeenCalled();
    });

    it('should do nothing when setting up next question', () => {
        spyOn(service, 'endGame');
        service.game.quiz = undefined;
        service['setupNextQuestion']();
        expect(service.endGame).not.toHaveBeenCalled();
    });
});
