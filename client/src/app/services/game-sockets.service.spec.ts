import { TestBed } from '@angular/core/testing';
import { Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

import { GameSocketsService } from './game-sockets.service';

describe('GameSocketsService', () => {
    let service: GameSocketsService;
    let socketMock: Socket;
    let ioSpy: jasmine.Spy;

    beforeEach(() => {
        socketMock = {
            emit: jasmine.createSpy('emit'),
            disconnect: jasmine.createSpy('disconnect'),
        } as unknown as Socket;

        ioSpy = jasmine.createSpy('io').and.returnValue(socketMock);
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
        expect(socketMock.disconnect).toHaveBeenCalled();
    });
});
