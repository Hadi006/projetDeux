import { TestBed } from '@angular/core/testing';
import { NEW_LOBBY } from '@common/constant';
import { LobbyData } from '@common/lobby-data';
import { Quiz } from '@common/quiz';
import { Socket } from 'socket.io-client';
import { environment } from 'src/environments/environment';

import { GameSocketsService } from './game-sockets.service';

describe('GameSocketsService', () => {
    const LOBBY_ID = 'lobby-id';
    const TEST_QUIZ: Quiz = {
        id: '1',
        title: 'Test Quiz',
        visible: true,
        description: 'Test Quiz Description',
        duration: 10,
        lastModification: new Date(),
        questions: [
            {
                id: '1',
                text: 'Question 1',
                type: 'QCM',
                points: 10,
                choices: [
                    { text: 'Answer 1', isCorrect: true },
                    { text: 'Answer 2', isCorrect: false },
                ],
            },
        ],
    };

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

    it('should create a lobby and join it', (done) => {
        spyOn(service, 'joinLobby');

        socketSpy.emit.and.callFake((event: string, lobbyId: string, callback: (lobbyData: LobbyData | null) => void) => {
            callback({ ...NEW_LOBBY, id: LOBBY_ID });
            return socketSpy;
        });

        service.createLobby(TEST_QUIZ).subscribe((lobbyData: LobbyData | null) => {
            expect(lobbyData).toEqual({ ...NEW_LOBBY, id: LOBBY_ID });
            expect(service.joinLobby).toHaveBeenCalledWith(LOBBY_ID);
            done();
        });
    });

    it('should not create a lobby', (done) => {
        spyOn(service, 'joinLobby');

        socketSpy.emit.and.callFake((event: string, lobbyId: string, callback: (lobbyData: LobbyData | null) => void) => {
            callback(null);
            return socketSpy;
        });

        service.createLobby(TEST_QUIZ).subscribe((lobbyData: LobbyData | null) => {
            expect(lobbyData).toBeUndefined();
            expect(service.joinLobby).not.toHaveBeenCalled();
            done();
        });
    });

    it('should join a lobby', () => {
        socketSpy.emit.and.callFake((event: string, roomId: string, callback: (errorMsg: string) => void) => {
            callback('');
            return socketSpy;
        });

        service.joinLobby(LOBBY_ID).subscribe((errorMsg) => {
            expect(errorMsg).toBe('');
        });
    });

    it('should not join a lobby', () => {
        socketSpy.emit.and.callFake((event: string, roomId: string, callback: (errorMsg: string) => void) => {
            callback('Error message');
            return socketSpy;
        });

        service.joinLobby(LOBBY_ID).subscribe((errorMsg) => {
            expect(errorMsg).toBe('Error message');
        });
    });

    it('should delete a lobby', () => {
        socketSpy.emit.and.callFake((event: string, roomId: string, callback: () => void) => {
            callback();
            return socketSpy;
        });

        service.deleteLobby(LOBBY_ID).subscribe(() => {
            expect(socketSpy.emit).toHaveBeenCalledWith('delete-lobby', LOBBY_ID, jasmine.any(Function));
        });
    });
});
