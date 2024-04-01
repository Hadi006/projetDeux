import { TestBed } from '@angular/core/testing';

import { HostSocketService } from './host-socket.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { SocketTestHelper } from '@app/test/socket-test-helper';
import { Socket } from 'socket.io-client';
import { TEST_GAME_DATA, TEST_HISTOGRAM_DATA, TEST_PLAYERS, TEST_QUIZZES } from '@common/constant';

class WebSocketServiceMock extends WebSocketService {
    override connect() {
        return;
    }
}
describe('HostSocketService', () => {
    let service: HostSocketService;
    let webSocketServiceMock: WebSocketServiceMock;
    let socketHelper: SocketTestHelper;

    beforeEach(async () => {
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
            done();
        });
        socketHelper.peerSideEmit('confirm-player-answer');
    });

    it('should listen for player updated', (done) => {
        service.connect();
        const expectedData = TEST_HISTOGRAM_DATA[0];
        service.onPlayerUpdated().subscribe((data) => {
            expect(data).toEqual(expectedData);
            done();
        });
        socketHelper.peerSideEmit('player-updated', expectedData);
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

    it('should emit toggle lock', () => {
        service.connect();
        const pin = '1';
        const locked = true;
        const emitSpy = spyOn(webSocketServiceMock, 'emit');
        service.emitToggleLock(pin, locked);
        expect(emitSpy).toHaveBeenCalledWith('toggle-lock', { pin, data: locked });
    });
});
