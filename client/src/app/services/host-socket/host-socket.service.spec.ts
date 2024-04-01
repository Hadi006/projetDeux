import { TestBed } from '@angular/core/testing';

import { HostSocketService } from './host-socket.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { SocketTestHelper } from '@app/test/socket-test-helper';
import { Socket } from 'socket.io-client';
import { TEST_PLAYERS } from '@common/constant';

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
        service.onPlayerJoined().subscribe((player) => {
            expect(player).toEqual(TEST_PLAYERS[0]);
            done();
        });
        socketHelper.peerSideEmit('player-joined', TEST_PLAYERS[0]);
    });
});
