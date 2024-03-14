import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Player } from '@common/player';
import { Question } from '@common/quiz';
import { PlayerService } from '@app/services/player.service';
import { TimeService } from './time.service';
import { WebSocketService } from '@app/services/web-socket.service';
import { SocketTestHelper } from '@app/test/socket-test-helper';
import { Socket } from 'socket.io-client';
import { TEST_PLAYERS, TEST_QUESTIONS } from '@common/constant';

class WebSocketServiceMock extends WebSocketService {
    override connect() {
        return;
    }
}

describe('PlayerService', () => {
    let testQuestions: Question[];
    let testPlayer: Player;
    let playerResponse: { player: Player; players: string[]; error: string };

    let service: PlayerService;
    let webSocketServiceMock: WebSocketServiceMock;
    let socketHelper: SocketTestHelper;
    let timeServiceSpy: jasmine.SpyObj<TimeService>;

    beforeEach(async () => {
        testQuestions = JSON.parse(JSON.stringify(TEST_QUESTIONS));
        testPlayer = JSON.parse(JSON.stringify(TEST_PLAYERS[0]));
        playerResponse = {
            player: { ...testPlayer },
            players: [],
            error: '',
        };

        socketHelper = new SocketTestHelper();
        webSocketServiceMock = new WebSocketServiceMock();
        webSocketServiceMock['socket'] = socketHelper as unknown as Socket;
        timeServiceSpy = jasmine.createSpyObj('TimeService', ['createTimerById', 'startTimerById', 'stopTimerById', 'setTimeById', 'getTimeById']);
        timeServiceSpy.createTimerById.and.returnValue(1);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                {
                    provide: WebSocketService,
                    useValue: webSocketServiceMock,
                },
                {
                    provide: TimeService,
                    useValue: timeServiceSpy,
                },
            ],
        });
        service = TestBed.inject(PlayerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create timer', () => {
        expect(timeServiceSpy.createTimerById).toHaveBeenCalled();
    });

    it('get player answers as an array of Answers', () => {
        service.player = testPlayer;
        expect(service.getPlayerAnswers()).toEqual(testQuestions[0].choices);
    });

    it('get player boolean answers', () => {
        service.player = testPlayer;
        expect(service.getPlayerBooleanAnswers()).toEqual(testQuestions[0].choices.map((choice) => choice.isCorrect));
    });

    it('handleSockets should connect to the web socket', () => {
        spyOn(webSocketServiceMock, 'connect');
        service.handleSockets();
        expect(webSocketServiceMock.connect).toHaveBeenCalled();
    });

    it('should start a timer on startGame', (done) => {
        const countdown = 10;
        service.handleSockets();
        socketHelper.on('start-game', () => {
            expect(timeServiceSpy.startTimerById).toHaveBeenCalledWith(1, countdown);
            done();
            return {};
        });
        socketHelper.peerSideEmit('start-game', countdown);
    });

    it('should confirm answer and stop timer on endQuestion', (done) => {
        service.handleSockets();
        socketHelper.on('end-question', () => {
            expect(service.answerConfirmed).toBeTrue();
            expect(timeServiceSpy.setTimeById).toHaveBeenCalledWith(1, 0);
            done();
            return {};
        });
        socketHelper.peerSideEmit('end-question');
    });

    it('should start a timer on nextQuestion', (done) => {
        const countdown = 10;
        service.handleSockets();
        socketHelper.on('next-question', () => {
            expect(timeServiceSpy.startTimerById).toHaveBeenCalled();
            done();
            return {};
        });
        socketHelper.peerSideEmit('next-question', { countdown });
    });

    it('should update scores on newScore', () => {
        service.player = testPlayer;
        const player = { ...testPlayer, score: 10 };
        service.handleSockets();

        socketHelper.on('new-score', (newPlayer) => {
            expect(newPlayer).toEqual(player);
            return {};
        });
        socketHelper.peerSideEmit('new-score', player);
    });

    it('should update answer on answer', () => {
        service.player = testPlayer;
        service.handleSockets();
        const answer = testQuestions[0].choices;
        socketHelper.on('answer', (newAnswer) => {
            expect(service.answer).toEqual(newAnswer);
            return {};
        });
        socketHelper.peerSideEmit('answer', answer);
    });

    it('should join game and create a player if there are no errors', (done) => {
        spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(playerResponse);
        });
        service.joinGame('1', 'test').subscribe((error) => {
            expect(error).toEqual(playerResponse.error);
            expect(service.player).toEqual(playerResponse.player);
            expect(service.players).toEqual(playerResponse.players);
            done();
        });
    });

    it('should not join game and create a player if there is an error', (done) => {
        const response = { ...playerResponse, error: 'Error' };
        spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(response);
        });
        service.joinGame('1', 'test').subscribe((error) => {
            expect(webSocketServiceMock.emit).toHaveBeenCalledWith('join-game', { pin: '1', playerName: 'test' }, jasmine.any(Function));
            expect(error).toEqual(response.error);
            expect(service.player).toBeUndefined();
            expect(service.players).toEqual([]);
            done();
        });
    });

    it('updatePlayer should update the player', () => {
        spyOn(webSocketServiceMock, 'emit');
        service.updatePlayer();
        expect(webSocketServiceMock.emit).toHaveBeenCalledWith('update-player', { pin: undefined, player: undefined });
    });

    it('handleKeyUp should confirm the answer if Enter is pressed', () => {
        service.player = testPlayer;
        service.player.questions = testQuestions;
        spyOn(service, 'confirmPlayerAnswer');
        service.handleKeyUp(new KeyboardEvent('keyup', { key: 'Enter' }));
        expect(service.confirmPlayerAnswer).toHaveBeenCalled();
    });

    it('handleKeyUp should toggle the answer if a number key is pressed', () => {
        service.player = testPlayer;
        service.player.questions = JSON.parse(JSON.stringify(testQuestions));
        service.handleKeyUp(new KeyboardEvent('keyup', { key: '1' }));
        expect(service.player.questions[service.player.questions.length - 1].choices[0].isCorrect).toBeTrue();
        service.handleKeyUp(new KeyboardEvent('keyup', { key: '1' }));
        expect(service.player.questions[service.player.questions.length - 1].choices[0].isCorrect).toBeFalse();
    });

    it('handleKeyUp should not toggle the answer if a number key is pressed out of range', () => {
        service.player = testPlayer;
        service.player.questions = JSON.parse(JSON.stringify(testQuestions));
        service.handleKeyUp(new KeyboardEvent('keyup', { key: '0' }));
        expect(service.player.questions[service.player.questions.length - 1].choices[0].isCorrect).toBeFalse();
        service.handleKeyUp(new KeyboardEvent('keyup', { key: '4' }));
        expect(service.player.questions[service.player.questions.length - 1].choices[0].isCorrect).toBeFalse();
    });

    it('handleKeyUp should not toggle the answer if a non-number key is pressed', () => {
        service.player = testPlayer;
        service.player.questions = JSON.parse(JSON.stringify(testQuestions));
        service.handleKeyUp(new KeyboardEvent('keyup', { key: 'a' }));
        service.player.questions[service.player.questions.length - 1].choices.forEach((choice) => {
            expect(choice.isCorrect).toBeFalse();
        });
    });

    it('confirmPlayerAnswer should confirm the answer', () => {
        spyOn(webSocketServiceMock, 'emit');
        service.confirmPlayerAnswer();
        expect(webSocketServiceMock.emit).toHaveBeenCalledWith('confirm-player-answer', { pin: undefined, player: undefined });
        expect(service.answerConfirmed).toBeTrue();
    });

    it('getTime should return get time from the service', () => {
        const time = 10;
        timeServiceSpy.getTimeById.and.returnValue(time);
        expect(service.getTime()).toEqual(time);
        expect(timeServiceSpy.getTimeById).toHaveBeenCalledWith(1);
    });

    it('cleanUp should disconnect the web socket and stop the timer', () => {
        spyOn(webSocketServiceMock, 'disconnect');
        service.cleanUp();
        expect(webSocketServiceMock.disconnect).toHaveBeenCalled();
        expect(timeServiceSpy.stopTimerById).toHaveBeenCalledWith(1);
    });

    it('setUpNextQuestion should reset the player answers', () => {
        const countdown = 10;
        spyOn(service, 'updatePlayer');
        service.player = testPlayer;
        const initialLength = service.player.questions.length;
        service.player.questions = testQuestions;
        service['internalAnswerConfirmed'] = true;
        service['setupNextQuestion'](testQuestions[0], countdown);
        expect(service.player.questions.length).toEqual(initialLength + 1);
        expect(service.player.questions[service.player.questions.length - 1]).toEqual(testQuestions[0]);
        expect(service.answerConfirmed).toBeFalse();
        expect(service.answer).toEqual([]);
        expect(service.isCorrect).toBeFalse();
        expect(service.updatePlayer).toHaveBeenCalled();
    });
});
