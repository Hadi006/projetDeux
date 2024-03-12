import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { Player } from '@common/player';
import { Question } from '@common/quiz';
import { PlayerHandlerService } from './player-handler.service';
import { TimeService } from './time.service';
import { WebSocketService } from '@app/services/web-socket.service';
import { SocketTestHelper } from '@app/test/socket-test-helper';
import { Socket } from 'socket.io-client';

class WebSocketServiceMock extends WebSocketService {
    override connect() {
        return;
    }
}

describe('PlayerHandlerService', () => {
    const TEST_QUESTIONS: Question[] = [
        {
            id: '0',
            points: 10,
            text: '1+1?',
            choices: [
                {
                    text: '1',
                    isCorrect: false,
                },
                {
                    text: '2',
                    isCorrect: false,
                },
            ],
            type: 'QCM',
        },
    ];

    const TEST_PLAYER: Player = {
        name: 'test',
        score: 0,
        questions: [...TEST_QUESTIONS],
        isCorrect: false,
    };

    const PLAYER_RESPONSE = {
        player: { ...TEST_PLAYER },
        players: [],
        error: '',
    };

    let service: PlayerHandlerService;
    let webSocketServiceMock: WebSocketServiceMock;
    let socketHelper: SocketTestHelper;
    let timeServiceSpy: jasmine.SpyObj<TimeService>;

    beforeEach(async () => {
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
        service = TestBed.inject(PlayerHandlerService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should create timer', () => {
        expect(timeServiceSpy.createTimerById).toHaveBeenCalled();
    });

    it('get player answers as an array of Answers', () => {
        service.player = { ...TEST_PLAYER };
        expect(service.getPlayerAnswers()).toEqual(TEST_QUESTIONS[0].choices);
    });

    it('get player boolean answers', () => {
        service.player = { ...TEST_PLAYER };
        expect(service.getPlayerBooleanAnswers()).toEqual(TEST_QUESTIONS[0].choices.map((choice) => choice.isCorrect));
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

    it('should confirm answer, show answer and stop timer on endQuestion', (done) => {
        service.handleSockets();
        socketHelper.on('end-question', () => {
            expect(service.answerConfirmed).toBeTrue();
            expect(service.showingAnswer).toBeTrue();
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
        service.player = { ...TEST_PLAYER };
        const player = { ...TEST_PLAYER, score: 10 };
        service.handleSockets();

        socketHelper.on('new-score', (newPlayer) => {
            expect(newPlayer).toEqual(player);
            return {};
        });
        socketHelper.peerSideEmit('new-score', player);
    });

    it('should join game and return errors', (done) => {
        const response = '';
        spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(response);
        });
        service.joinGame('1').subscribe((error) => {
            expect(error).toEqual(response);
            done();
        });
    });

    it('createPlayer should create a player', (done) => {
        spyOn(service, 'handleSockets');
        spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback({ ...PLAYER_RESPONSE });
        });
        service.createPlayer('1', 'test').subscribe((error) => {
            expect(webSocketServiceMock.emit).toHaveBeenCalledWith('create-player', { pin: '1', playerName: 'test' }, jasmine.any(Function));
            expect(error).toBeFalsy();
            expect(service.player).toEqual(PLAYER_RESPONSE.player);
            expect(service.players).toEqual(PLAYER_RESPONSE.players);
            expect(service.handleSockets).toHaveBeenCalled();
            done();
        });
    });

    it('should not create a player if there is an error', (done) => {
        const response = { ...PLAYER_RESPONSE, error: 'Error' };
        spyOn(service, 'handleSockets');
        spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(response);
        });
        service.createPlayer('1', 'test').subscribe((error) => {
            expect(webSocketServiceMock.emit).toHaveBeenCalledWith('create-player', { pin: '1', playerName: 'test' }, jasmine.any(Function));
            expect(error).toEqual(response.error);
            expect(service.player).toBeUndefined();
            expect(service.players).toEqual([]);
            expect(service.handleSockets).not.toHaveBeenCalled();
            done();
        });
    });

    it('updatePlayer should update the player', () => {
        spyOn(webSocketServiceMock, 'emit');
        service.updatePlayer();
        expect(webSocketServiceMock.emit).toHaveBeenCalledWith('update-player', { lobbyId: undefined, player: undefined });
    });

    it('handleKeyUp should confirm the answer if Enter is pressed', () => {
        service.player = { ...TEST_PLAYER };
        service.player.questions = JSON.parse(JSON.stringify(TEST_QUESTIONS));
        spyOn(service, 'confirmPlayerAnswer');
        service.handleKeyUp(new KeyboardEvent('keyup', { key: 'Enter' }));
        expect(service.confirmPlayerAnswer).toHaveBeenCalled();
    });

    it('handleKeyUp should toggle the answer if a number key is pressed', () => {
        service.player = { ...TEST_PLAYER };
        service.player.questions = JSON.parse(JSON.stringify(TEST_QUESTIONS));
        service.handleKeyUp(new KeyboardEvent('keyup', { key: '1' }));
        expect(service.player.questions[0].choices[0].isCorrect).toBeTrue();
        service.handleKeyUp(new KeyboardEvent('keyup', { key: '1' }));
        expect(service.player.questions[0].choices[0].isCorrect).toBeFalse();
    });

    it('handleKeyUp should not toggle the answer if a number key is pressed out of range', () => {
        service.player = { ...TEST_PLAYER };
        service.player.questions = JSON.parse(JSON.stringify(TEST_QUESTIONS));
        service.handleKeyUp(new KeyboardEvent('keyup', { key: '0' }));
        expect(service.player.questions[0].choices[0].isCorrect).toBeFalse();
        service.handleKeyUp(new KeyboardEvent('keyup', { key: '4' }));
        expect(service.player.questions[0].choices[0].isCorrect).toBeFalse();
    });

    it('handleKeyUp should not toggle the answer if a non-number key is pressed', () => {
        service.player = { ...TEST_PLAYER };
        service.player.questions = JSON.parse(JSON.stringify(TEST_QUESTIONS));
        service.handleKeyUp(new KeyboardEvent('keyup', { key: 'a' }));
        service.player.questions[0].choices.forEach((choice) => {
            expect(choice.isCorrect).toBeFalse();
        });
    });

    it('confirmPlayerAnswer should confirm the answer', () => {
        spyOn(webSocketServiceMock, 'emit');
        service.confirmPlayerAnswer();
        expect(webSocketServiceMock.emit).toHaveBeenCalledWith('confirm-player-answer', undefined);
        expect(service.answerConfirmed).toBeTrue();
    });

    it('time should return get time from the service', () => {
        const time = 10;
        timeServiceSpy.getTimeById.and.returnValue(time);
        expect(service.time()).toEqual(time);
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
        service.player = { ...TEST_PLAYER };
        service.player.questions = JSON.parse(JSON.stringify(TEST_QUESTIONS));
        service['internalAnswerConfirmed'] = true;
        service['setupNextQuestion'](TEST_QUESTIONS[0], countdown);
        expect(service.player.questions.length).toEqual(2);
        expect(service.player.questions[1]).toEqual(TEST_QUESTIONS[0]);
        expect(service.answerConfirmed).toBeFalse();
        expect(service.player.isCorrect).toBeFalse();
        expect(service.updatePlayer).toHaveBeenCalled();
    });
});
