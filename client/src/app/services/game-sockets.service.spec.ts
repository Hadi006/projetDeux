import { TestBed } from '@angular/core/testing';
import { Acknowledgment } from '@common/acknowledgment';
import { Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

import { GameSocketsService } from './game-sockets.service';

describe('GameSocketsService', () => {
    const LOBBY_ID = 'lobby-id';

    let service: GameSocketsService;
    let socketSpy: jasmine.SpyObj<Socket>;
    let ioSpy: jasmine.Spy;

    beforeEach(() => {
        socketSpy = jasmine.createSpyObj('Socket', ['emit', 'disconnect']);

        ioSpy = jasmine.createSpy('io').and.returnValue(socketSpy);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({});
    });

    beforeEach(() => {
        service = TestBed.inject(GameSocketsService);
        service['socket'] = ioSpy(environment.serverUrl, { transports: ['websocket'], upgrade: false });
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should disconnect the socket', () => {
        service.disconnect();
        expect(socketSpy.disconnect).toHaveBeenCalled();
    });

    it('should create a lobby and join it', (done) => {
        spyOn(service, 'joinLobby');

        socketSpy.emit.and.callFake((event: string, lobbyId: string, callback: (ack: Acknowledgment) => void) => {
            callback({ success: true });
            return socketSpy;
        });

        service.createLobby(LOBBY_ID).subscribe((success) => {
            expect(success).toBeTrue();
            expect(service.joinLobby).toHaveBeenCalledWith(LOBBY_ID);
            done();
        });
    });

    it('should not create a lobby', (done) => {
        spyOn(service, 'joinLobby');

        socketSpy.emit.and.callFake((event: string, lobbyId: string, callback: (ack: Acknowledgment) => void) => {
            callback({ success: false });
            return socketSpy;
        });

        service.createLobby(LOBBY_ID).subscribe((success) => {
            expect(success).toBeFalse();
            expect(service.joinLobby).not.toHaveBeenCalled();
            done();
        });
    });

    it('should join a lobby', () => {
        service.joinLobby(LOBBY_ID);
        expect(socketSpy.emit).toHaveBeenCalledWith('join-lobby', LOBBY_ID);
    });
});
