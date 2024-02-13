import { TestBed } from '@angular/core/testing';
import { LobbyService } from '@app/services/lobby.service';
import { SocketService } from '@app/services/socket.service';
import { LobbyData } from '@common/lobby-data';
import { Quiz } from '@common/quiz';
import { of } from 'rxjs';

describe('LobbyService', () => {
    const quizData: Quiz = {
        id: '0',
        title: 'Math',
        visible: true,
        description: 'Math quiz',
        duration: 5,
        lastModification: new Date(),
        questions: [],
    };
    const lobbyData: LobbyData = { id: 1, players: [], quiz: quizData, started: true };
    const newData: LobbyData = {
        id: 1,
        players: [{ id: 1, name: 'Player 1' }],
        started: false,
    };

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

    it('should update lobbyData when data is received', () => {
        socketServiceSpy.filteredDataByType.and.returnValue(of(newData));
        service.subscribeLobbyToServer(lobbyData);
        expect(socketServiceSpy.filteredDataByType).toHaveBeenCalledWith('lobbyData');
        expect(lobbyData).toEqual(newData);
    });
});
