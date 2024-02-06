import { TestBed } from '@angular/core/testing';
import { ServerData } from '@common/server-data';
import { Subject } from 'rxjs';
import { WebSocketSubject } from 'rxjs/webSocket';

import { SocketService } from './socket.service';

describe('SocketService', () => {
    let service: SocketService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(SocketService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should filter data by type', async () => {
        const webSocketSubjectMock = new Subject<ServerData>() as WebSocketSubject<ServerData>;
        service['webSocket'] = webSocketSubjectMock;
        const type = 'test';
        const data: ServerData = { type, data: '{ "message": "test" }' };
        const filteredData = service.filteredDataByType(type);
        filteredData.subscribe({
            next: (filtered) => {
                expect(filtered).toEqual(JSON.parse(data.data));
            },
            error: (err) => {
                fail(err);
            },
        });
        webSocketSubjectMock.next(data);
    });
});
