import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LobbyService } from '@app/services/lobby.service';
import { SocketService } from '@app/services/socket.service';
import { LobbyData } from '@common/lobby-data';
import { Quiz } from '@common/quiz';
import { of } from 'rxjs';
import { GameHandlerService } from '@app/services/game-handler.service';
import { TEST_LOBBY_DATA } from '@common/constant';

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
    const newData: LobbyData = {
        id: 1,
        players: [
            {
                id: 1,
                name: 'Player 1',
                score: 0,
                answer: [],
                answerConfirmed: false,
                isCorrect: false,
            },
        ],
        started: false,
    };

    let service: LobbyService;
    let socketServiceSpy: jasmine.SpyObj<SocketService>;
    let gameHandlerServiceSpy: jasmine.SpyObj<GameHandlerService>;

    beforeEach(() => {
        socketServiceSpy = jasmine.createSpyObj('SocketService', ['filteredDataByType']);
        gameHandlerServiceSpy = {} as jasmine.SpyObj<GameHandlerService>;
        Object.defineProperty(gameHandlerServiceSpy, 'quizData', { value: quizData });
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: SocketService, useValue: socketServiceSpy },
                { provide: GameHandlerService, useValue: gameHandlerServiceSpy },
            ],
        });
        service = TestBed.inject(LobbyService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should assign lobbyData', () => {
        expect(service.lobbyData).toEqual({ ...TEST_LOBBY_DATA, quiz: quizData });
    });

    it('should update lobbyData when data is received', () => {
        socketServiceSpy.filteredDataByType.and.returnValue(of(newData));
        service.subscribeLobbyToServer();
        expect(socketServiceSpy.filteredDataByType).toHaveBeenCalledWith('lobbyData');
        expect(service.lobbyData).toEqual(newData);
    });
});
