import { TestBed } from '@angular/core/testing';
import { environment } from 'src/environments/environment';

import { GameSocketsService } from './game-sockets.service';

describe('GameSocketsService', () => {
    let service: GameSocketsService;
    let socketMock;
    let ioSpy: jasmine.Spy;

    beforeEach(() => {
        socketMock = {
            emit: jasmine.createSpy('emit'),
            disconnect: jasmine.createSpy('disconnect'),
        };

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
});
