import { TestBed } from '@angular/core/testing';

import { HostSocketService } from './host-socket.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { SocketTestHelper } from '@app/test/socket-test-helper';
import { Socket } from 'socket.io-client';
import { TEST_ANSWERS, TEST_GAME_DATA, TEST_HISTOGRAM_DATA, TEST_PLAYERS, TEST_QUIZZES } from '@common/constant';

class WebSocketServiceMock extends WebSocketService {
    override connect() {
        return;
    }
}
describe('HostSocketService', () => {
    let service: HostSocketService;
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
        service = TestBed.inject(HostSocketService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
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

    it('should check if connected', () => {
        const isConnectedSpy = spyOn(webSocketServiceMock, 'isSocketAlive');
        service.isConnected();
        expect(isConnectedSpy).toHaveBeenCalled();
    });

    it('should listen for player joined', (done) => {
        service.connect();
        const expectedPlayer = JSON.parse(JSON.stringify(TEST_PLAYERS[0]));
        service.onPlayerJoined().subscribe((player) => {
            expect(player).toEqual(expectedPlayer);
            done();
        });
        socketHelper.peerSideEmit('player-joined', expectedPlayer);
    });

    it('should listen for player left', (done) => {
        service.connect();
        const expectedData = { players: TEST_PLAYERS, player: TEST_PLAYERS[0] };
        service.onPlayerLeft().subscribe((data) => {
            expect(data).toEqual(expectedData);
            done();
        });
        socketHelper.peerSideEmit('player-left', expectedData);
    });

    it('should listen for confirm player answer', (done) => {
        service.connect();
        service.onConfirmPlayerAnswer().subscribe(() => {
            expect(true).toBeTrue();
            done();
        });
        socketHelper.peerSideEmit('confirm-player-answer');
    });

    it('should listen for player updated', (done) => {
        service.connect();
        const expectedData = { player: TEST_PLAYERS[0], histogramData: TEST_HISTOGRAM_DATA[0] };
        service.onPlayerUpdated().subscribe((data) => {
            expect(data).toEqual(expectedData);
            done();
        });
        socketHelper.peerSideEmit('player-updated', expectedData);
    });

    it('should listen for new host', (done) => {
        service.connect();
        const expectedGame = JSON.parse(JSON.stringify(TEST_GAME_DATA));
        service.onNewHost().subscribe((game) => {
            expect(game).toEqual(expectedGame);
            done();
        });
        socketHelper.peerSideEmit('new-host', expectedGame);
    });

    it('should emit create game', (done) => {
        service.connect();
        const quiz = JSON.parse(JSON.stringify(TEST_QUIZZES[0]));
        const expectedGame = JSON.parse(JSON.stringify(TEST_GAME_DATA));
        spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(expectedGame);
        });
        service.emitCreateGame(quiz).subscribe((game) => {
            expect(game).toEqual(expectedGame);
            done();
        });
    });

    it('should emit undefined', (done) => {
        service.connect();
        const quiz = JSON.parse(JSON.stringify(TEST_QUIZZES[0]));
        spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(undefined);
        });
        service.emitCreateGame(quiz).subscribe((game) => {
            expect(game).toBeUndefined();
            done();
        });
    });

    it('should emit request game', (done) => {
        service.connect();
        const pin = '1';
        const expectedGame = JSON.parse(JSON.stringify(TEST_GAME_DATA));
        spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(expectedGame);
        });
        service.emitRequestGame(pin).subscribe((game) => {
            expect(game).toEqual(expectedGame);
            done();
        });
    });

    it('should emit toggle lock', () => {
        service.connect();
        const pin = '1';
        const locked = true;
        const emitSpy = spyOn(webSocketServiceMock, 'emit');
        service.emitToggleLock(pin, locked);
        expect(emitSpy).toHaveBeenCalledWith('toggle-lock', { pin, data: locked });
    });

    it('should emit kick player', () => {
        service.connect();
        const pin = '1';
        const playerName = 'Player 1';
        const emitSpy = spyOn(webSocketServiceMock, 'emit');
        service.emitKick(pin, playerName);
        expect(emitSpy).toHaveBeenCalledWith('kick', { pin, data: playerName });
    });

    it('should emit mute player', () => {
        service.connect();
        const pin = '1';
        const player = JSON.parse(JSON.stringify(TEST_PLAYERS[0]));
        const emitSpy = spyOn(webSocketServiceMock, 'emit');
        service.emitMute(pin, player);
        expect(emitSpy).toHaveBeenCalledWith('mute', { pin, data: player });
    });

    it('should emit start game', () => {
        service.connect();
        const pin = '1';
        const countdown = 10;
        const emitSpy = spyOn(webSocketServiceMock, 'emit');
        service.emitStartGame(pin, countdown);
        expect(emitSpy).toHaveBeenCalledWith('start-game', { pin, data: countdown });
    });

    it('should emit next question', () => {
        service.connect();
        const pin = '1';
        const data = { question: TEST_QUIZZES[0].questions[0], countdown: 10, histogram: TEST_HISTOGRAM_DATA[0] };
        const emitSpy = spyOn(webSocketServiceMock, 'emit');
        service.emitNextQuestion(pin, data);
        expect(emitSpy).toHaveBeenCalledWith('next-question', { pin, data });
    });

    it('should emit end game', (done) => {
        service.connect();
        const pin = '1';
        const expectedGame = JSON.parse(JSON.stringify(TEST_GAME_DATA));
        spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(expectedGame);
        });
        service.emitEndGame(pin).subscribe((game) => {
            expect(game).toEqual(expectedGame);
            done();
        });
    });

    it('should emit end question', () => {
        service.connect();
        const pin = '1';
        const emitSpy = spyOn(webSocketServiceMock, 'emit');
        service.emitEndQuestion(pin);
        expect(emitSpy).toHaveBeenCalledWith('end-question', pin);
    });

    it('should emit update scores', (done) => {
        service.connect();
        const pin = '1';
        const currentQuestionIndex = 1;
        const expectedGame = JSON.parse(JSON.stringify(TEST_GAME_DATA));
        spyOn(webSocketServiceMock, 'emit').and.callFake((event, data, callback: (response: unknown) => void) => {
            callback(expectedGame);
        });
        service.emitUpdateScores(pin, currentQuestionIndex).subscribe((game) => {
            expect(game).toEqual(expectedGame);
            done();
        });
    });

    it('should emit answer', () => {
        service.connect();
        const pin = '1';
        const currentAnswer = JSON.parse(JSON.stringify(TEST_ANSWERS));
        const emitSpy = spyOn(webSocketServiceMock, 'emit');
        service.emitAnswer(pin, currentAnswer);
        expect(emitSpy).toHaveBeenCalledWith('answer', { pin, data: currentAnswer });
    });
});
