import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { LobbyService } from '@app/services/lobby.service';
import { Quiz } from '@common/quiz';
import { GameHandlerService } from '@app/services/game-handler.service';
import { GameSocketsService } from './game-sockets.service';
import { LOBBY_ID_CHARACTERS, LOBBY_ID_LENGTH } from '@common/constant';
import { LobbyData } from '@common/lobby-data';
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
    const lobbyData: LobbyData = {
        id: '1234',
        players: [],
        started: false,
        quiz: quizData,
    };
    let service: LobbyService;
    let gameHandlerServiceSpy: jasmine.SpyObj<GameHandlerService>;
    let gameSocketServiceSpy: jasmine.SpyObj<GameSocketsService>;

    beforeEach(() => {
        gameHandlerServiceSpy = jasmine.createSpyObj('GameHandlerService', ['cleanUp']);
        Object.defineProperty(gameHandlerServiceSpy, 'quizData', {
            get: () => quizData,
        });

        gameSocketServiceSpy = jasmine.createSpyObj('GameSocketsService', ['connect', 'createLobby', 'disconnect']);
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
        gameSocketServiceSpy.createLobby.and.returnValue(of(lobbyData));
        service.createLobby();
        expect(service.lobbyData.id.length).toEqual(LOBBY_ID_LENGTH);

        for (let i = 0; i < LOBBY_ID_LENGTH; i++) {
            expect(LOBBY_ID_CHARACTERS).toContain(service.lobbyData.id.charAt(i));
        }

        expect(service.lobbyData.quiz).toEqual(quizData);
        if (gameHandlerServiceSpy.quizData) {
            expect(gameSocketServiceSpy.createLobby).toHaveBeenCalledWith(gameHandlerServiceSpy.quizData);
        }
    });

    it('should clean up the game socket', () => {
        service.cleanUp();
        expect(gameSocketServiceSpy.disconnect).toHaveBeenCalled();
        expect(gameHandlerServiceSpy.cleanUp).toHaveBeenCalled();
    });
});
