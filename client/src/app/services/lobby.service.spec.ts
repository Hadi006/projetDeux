import { TestBed } from '@angular/core/testing';

import { LobbyService } from '@app/services/lobby.service';
import { SocketService } from '@app/services/socket.service';

describe('LobbyService', () => {
    let service: LobbyService;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['filteredDataByType']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [{ provide: SocketService, useValue: socketServiceSpy }],
        });
        service = TestBed.inject(LobbyService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });
});
