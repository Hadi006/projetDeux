import { TestBed } from '@angular/core/testing';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { SocketTestHelper } from '@app/test/socket-test-helper';
import { TEST_PLAYERS } from '@common/constant';
import { Socket } from 'socket.io-client';

import { ChatSocketService } from './chat-socket.service';

class WebSocketServiceMock extends WebSocketService {
    override connect() {
        return;
    }
}
describe('ChatSocketService', () => {
    let service: ChatSocketService;
    let webSocketServiceMock: WebSocketServiceMock;
    let socketHelper: SocketTestHelper;

    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        webSocketServiceMock = new WebSocketServiceMock();
        webSocketServiceMock['socket'] = socketHelper as unknown as Socket;
    });

    beforeEach(() => {
        TestBed.configureTestingModule({ providers: [{ provide: WebSocketService, useValue: webSocketServiceMock }] });
        service = TestBed.inject(ChatSocketService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should check if connected', () => {
        spyOn(webSocketServiceMock, 'isSocketAlive').and.returnValue(true);
        expect(service.isConnected()).toBeTrue();
    });

    it('should connect', () => {
        spyOn(webSocketServiceMock, 'connect');
        service.connect();
        expect(webSocketServiceMock.connect).toHaveBeenCalled();
    });

    it('should disconnect', () => {
        spyOn(webSocketServiceMock, 'disconnect');
        service.disconnect();
        expect(webSocketServiceMock.disconnect).toHaveBeenCalled();
    });

    it('should listen for message received', (done) => {
        service.connect();
        const expectedMessage = { text: 'text', author: 'author', timestamp: new Date() };
        service.onMessageReceived().subscribe((message) => {
            expect(message).toEqual(expectedMessage);
            done();
        });
        socketHelper.peerSideEmit('message-received', expectedMessage);
    });

    it('should listen for player muted', (done) => {
        service.connect();
        const expectedMessage = { text: 'text', author: 'author', timestamp: new Date() };
        service.onPlayerMuted().subscribe((message) => {
            expect(message).toEqual(expectedMessage);
            done();
        });
        socketHelper.peerSideEmit('player-muted', expectedMessage);
    });

    it('should listen for player left', (done) => {
        service.connect();
        const expectedData = { player: TEST_PLAYERS[0], players: TEST_PLAYERS };
        service.onPlayerLeft().subscribe((data) => {
            expect(data).toEqual(expectedData);
            done();
        });
        socketHelper.peerSideEmit('player-left', expectedData);
    });

    it('should emit new message', () => {
        service.connect();
        spyOn(webSocketServiceMock, 'emit');
        service.emitNewMessage('pin', { text: 'text', author: 'author', timestamp: new Date() });
        expect(webSocketServiceMock.emit).toHaveBeenCalledWith('new-message', {
            pin: 'pin',
            data: { text: 'text', author: 'author', timestamp: jasmine.any(Date) },
        });
    });
});
