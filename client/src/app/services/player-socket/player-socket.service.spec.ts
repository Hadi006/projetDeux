import { TestBed } from '@angular/core/testing';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { SocketTestHelper } from '@app/test/socket-test-helper';
import { TEST_ANSWERS, TEST_GAME_DATA, TEST_PLAYERS, TEST_QUESTIONS } from '@common/constant';
import { Socket } from 'socket.io-client';
import { PlayerSocketService } from './player-socket.service';

class WebSocketServiceMock extends WebSocketService {
    override connect() {
        return;
    }
}

describe('PlayerSocketService', () => {
    let service: PlayerSocketService;
    let webSocketServiceMock: WebSocketServiceMock;
    let socketHelper: SocketTestHelper;

    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        webSocketServiceMock = new WebSocketServiceMock();
        webSocketServiceMock['socket'] = socketHelper as unknown as Socket;
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: WebSocketService, useValue: webSocketServiceMock }],
        });
        service = TestBed.inject(PlayerSocketService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should check if connected', () => {
        spyOn(webSocketServiceMock, 'isSocketAlive').and.returnValue(true);
        expect(service.isConnected()).toBeTrue();
    });

    it('should connect', () => {
        const connectSpy = spyOn(webSocketServiceMock, 'connect');
        service.connect();
        expect(connectSpy).toHaveBeenCalled();
    });

    it('should disconnect', () => {
        const disconnectSpy = spyOn(webSocketServiceMock, 'disconnect');
        service.disconnect();
        expect(disconnectSpy).toHaveBeenCalled();
    });

    it('should listen for player joined', (done) => {
        service.connect();
        const expectedPlayerName = 'player1';
        service.onPlayerJoined().subscribe((playerName) => {
            expect(playerName).toEqual(expectedPlayerName);
            done();
        });
        socketHelper.peerSideEmit('player-joined', { name: expectedPlayerName });
    });

    it('should listen for player left', (done) => {
        service.connect();
        const expectedPlayers = JSON.parse(JSON.stringify(TEST_PLAYERS));
        service.onPlayerLeft().subscribe((players) => {
            expect(players).toEqual(expectedPlayers);
            done();
        });
        socketHelper.peerSideEmit('player-left', { players: expectedPlayers });
    });

    it('should listen for kick', (done) => {
        service.connect();
        const expectedPlayerName = 'player1';
        service.onKick().subscribe((playerName) => {
            expect(playerName).toEqual(expectedPlayerName);
            done();
        });
        socketHelper.peerSideEmit('kick', expectedPlayerName);
    });

    it('should listen for start game', (done) => {
        service.connect();
        const expectedCountdown = 3;
        service.onStartGame().subscribe((countdown) => {
            expect(countdown).toEqual(expectedCountdown);
            done();
        });
        socketHelper.peerSideEmit('start-game', expectedCountdown);
    });

    it('should listen for end question', (done) => {
        service.connect();
        service.onEndQuestion().subscribe(() => {
            expect(true).toBeTrue();
            done();
        });
        socketHelper.peerSideEmit('end-question');
    });

    it('should listen for question changed', (done) => {
        service.connect();
        const expectedData = { question: JSON.parse(JSON.stringify(TEST_QUESTIONS[0])), countdown: 3 };
        service.onQuestionChanged().subscribe((data) => {
            expect(data).toEqual(expectedData);
            done();
        });
        socketHelper.peerSideEmit('question-changed', expectedData);
    });

    it('should listen for new score', (done) => {
        service.connect();
        const expectedPlayer = JSON.parse(JSON.stringify(TEST_PLAYERS[0]));
        service.onNewScore().subscribe((player) => {
            expect(player).toEqual(expectedPlayer);
            done();
        });
        socketHelper.peerSideEmit('new-score', expectedPlayer);
    });

    it('should listen for answer', (done) => {
        service.connect();
        const expectedAnswer = JSON.parse(JSON.stringify(TEST_ANSWERS));
        service.onAnswer().subscribe((answer) => {
            expect(answer).toEqual(expectedAnswer);
            done();
        });
        socketHelper.peerSideEmit('answer', expectedAnswer);
    });

    it('should listen for game ended', (done) => {
        service.connect();
        const expectedGame = JSON.parse(JSON.stringify(TEST_GAME_DATA));
        service.onGameEnded().subscribe((game) => {
            expect(game).toEqual(expectedGame);
            done();
        });
        socketHelper.peerSideEmit('game-ended', expectedGame);
    });

    it('should listen for game deleted', (done) => {
        service.connect();
        service.onGameDeleted().subscribe(() => {
            expect(true).toBeTrue();
            done();
        });
        socketHelper.peerSideEmit('game-deleted');
    });

    it('should listen for timer paused event', (done) => {
        service.connect();
        service.onPauseTimerForPlayers().subscribe(() => {
            expect(true).toBeTrue();
            done();
        });
        socketHelper.peerSideEmit('timer-paused');
    });

    it('should listen for panic mode start event', (done) => {
        service.connect();
        service.onStartPanicMode().subscribe(() => {
            expect(true).toBeTrue();
            done();
        });
        socketHelper.peerSideEmit('in-panic');
    });

    it('should emit join game', (done) => {
        service.connect();
        const expectedPin = '1234';
        const expectedPlayerName = 'player1';
        const result = { player: JSON.parse(JSON.stringify(TEST_PLAYERS[0])), gameTitle: 'Test Game', gameId: '1', otherPlayers: [], error: '' };
        spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(result);
        });
        service.emitJoinGame(expectedPin, { playerName: expectedPlayerName, isHost: false }).subscribe((response) => {
            expect(response).toEqual(result);
            done();
        });
    });

    it('should emit update player', () => {
        service.connect();
        spyOn(webSocketServiceMock, 'emit');
        service.emitUpdatePlayer('1234', JSON.parse(JSON.stringify(TEST_PLAYERS[0])));
        expect(webSocketServiceMock.emit).toHaveBeenCalledWith('update-player', { pin: '1234', data: JSON.parse(JSON.stringify(TEST_PLAYERS[0])) });
    });

    it('should emit confirm player answer', () => {
        service.connect();
        spyOn(webSocketServiceMock, 'emit');
        service.emitConfirmPlayerAnswer('1234', JSON.parse(JSON.stringify(TEST_PLAYERS[0])));
        expect(webSocketServiceMock.emit).toHaveBeenCalledWith('confirm-player-answer', {
            pin: '1234',
            data: JSON.parse(JSON.stringify(TEST_PLAYERS[0])),
        });
    });
});
