import { TestBed } from '@angular/core/testing';
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

    it('should create a lobby and join it', () => {
        spyOn(service, 'joinLobby');
        service.createLobby(LOBBY_ID);
        expect(socketSpy.emit).toHaveBeenCalledWith('create-lobby', LOBBY_ID);
        expect(service.joinLobby).toHaveBeenCalledWith(LOBBY_ID);
    });

    it('should join a lobby', () => {
        service.joinLobby(LOBBY_ID);
        expect(socketSpy.emit).toHaveBeenCalledWith('join-lobby', LOBBY_ID);
    });
});
