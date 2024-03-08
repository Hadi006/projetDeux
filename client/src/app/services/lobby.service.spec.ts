import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LobbyService } from '@app/services/lobby.service';
import { Quiz } from '@common/quiz';
import { GameHandlerService } from '@app/services/game-handler.service';
import { TEST_LOBBY_DATA } from '@common/constant';
import { GameSocketsService } from './game-sockets.service';

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

    it('should assign lobby data', () => {
        expect(service.lobbyData).toEqual({ ...TEST_LOBBY_DATA, quiz: quizData });
    });
});
