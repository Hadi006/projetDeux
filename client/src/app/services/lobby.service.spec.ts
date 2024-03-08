import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LobbyService } from '@app/services/lobby.service';
import { Quiz } from '@common/quiz';
import { GameHandlerService } from '@app/services/game-handler.service';
import { GameSocketsService } from './game-sockets.service';
import { LOBBY_ID_CHARACTERS, LOBBY_ID_LENGTH } from '@common/constant';

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
    let service: LobbyService;
    let gameHandlerServiceSpy: jasmine.SpyObj<GameHandlerService>;
    let gameSocketServiceSpy: jasmine.SpyObj<GameSocketsService>;

    beforeEach(() => {
        gameHandlerServiceSpy = {} as jasmine.SpyObj<GameHandlerService>;
        Object.defineProperty(gameHandlerServiceSpy, 'quizData', {
            get: () => quizData,
        });

        gameSocketServiceSpy = jasmine.createSpyObj('GameSocketsService', ['connect', 'createRoom', 'disconnect']);
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [
                { provide: GameHandlerService, useValue: gameHandlerServiceSpy },
                { provide: GameSocketsService, useValue: gameSocketServiceSpy },
            ],
        });
        service = TestBed.inject(LobbyService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should connect the game socket', () => {
        expect(gameSocketServiceSpy.connect).toHaveBeenCalled();
    });

    it('should create a lobby and call the create room method', () => {
        service.createLobby();
        expect(service.lobbyData.id.length).toEqual(LOBBY_ID_LENGTH);

        for (let i = 0; i < LOBBY_ID_LENGTH; i++) {
            expect(LOBBY_ID_CHARACTERS).toContain(service.lobbyData.id.charAt(i));
        }

        expect(service.lobbyData.quiz).toEqual(quizData);
        expect(gameSocketServiceSpy.createRoom).toHaveBeenCalledWith(service.lobbyData.id);
    });
});
