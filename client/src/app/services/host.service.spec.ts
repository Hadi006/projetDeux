// import { HttpClientTestingModule } from '@angular/common/http/testing';
// import { TestBed } from '@angular/core/testing';
// import { HostService } from '@app/services/host.service';
// import { Quiz } from '@common/quiz';
// import { LOBBY_ID_LENGTH } from '@common/constant';
// import { LobbyData } from '@common/lobby-data';
// import { WebSocketService } from './web-socket.service';
// import { Router } from '@angular/router';

// describe('HostService', () => {
//     const quizData: Quiz = {
//         id: '0',
//         title: 'Math',
//         visible: true,
//         description: 'Math quiz',
//         duration: 5,
//         lastModification: new Date(),
//         questions: [],
//     };
//     const lobbyData: LobbyData = {
//         id: '1234',
//         players: [],
//         locked: false,
//         quiz: quizData,
//     };
//     let service: HostService;
//     let webSocketServiceSpy: jasmine.SpyObj<WebSocketService>;
//     let routerSpy: jasmine.SpyObj<Router>;

//     beforeEach(() => {
//         webSocketServiceSpy = jasmine.createSpyObj('GameSocketsService', ['connect', 'onEvent', 'emit', 'disconnect']);
//         routerSpy = jasmine.createSpyObj('Router', ['navigate']);
//     });

//     beforeEach(() => {
//         TestBed.configureTestingModule({
//             imports: [HttpClientTestingModule],
//             providers: [
//                 { provide: WebSocketService, useValue: webSocketServiceSpy },
//                 { provide: Router, useValue: routerSpy },
//             ],
//         });
//         service = TestBed.inject(HostService);
//     });

//     it('should be created', () => {
//         expect(service).toBeTruthy();
//     });

//     it('should create a lobby, connect the socket and call the create room method', (done) => {
//         service.handleSockets();
//         webSocketServiceSpy.emit.and.callFake((event, data, callback: (lobbyData: unknown) => void) => {
//             callback(lobbyData as LobbyData);
//         });
//         service.createLobby(quizData).subscribe((result) => {
//             expect(result).toBeTrue();
//             expect(webSocketServiceSpy.connect).toHaveBeenCalled();
//             expect(service.lobbyData.id.length).toEqual(LOBBY_ID_LENGTH);
//             expect(service.lobbyData.quiz).toEqual(quizData);
//             expect(webSocketServiceSpy.emit).toHaveBeenCalledWith('create-lobby', quizData, jasmine.any(Function));
//             done();
//         });
//     });

//     it('should not create a lobby if there is no quiz data', () => {
//         service.createLobby(quizData).subscribe((result) => {
//             expect(result).toBeFalse();
//             expect(webSocketServiceSpy.connect).not.toHaveBeenCalled();
//         });
//     });

//     it('should not create a lobby if creation was unsuccessful', () => {
//         service.handleSockets();
//         webSocketServiceSpy.emit.and.callFake((event, data, callback: (lobbyData: unknown) => void) => {
//             callback(null);
//         });
//         service.createLobby(quizData).subscribe((result) => {
//             expect(result).toBeFalse();
//             expect(webSocketServiceSpy.connect).toHaveBeenCalled();
//             expect(webSocketServiceSpy.emit).toHaveBeenCalledWith('create-lobby', quizData, jasmine.any(Function));
//         });
//     });

//     it('should clean up the game socket', () => {
//         webSocketServiceSpy.emit.and.callFake((event, data, callback: (lobbyData: unknown) => void) => {
//             callback(lobbyData as LobbyData);
//         });
//         service.createLobby(quizData).subscribe(() => {
//             webSocketServiceSpy.emit.and.callFake((event, data, callback: (lobbyData: unknown) => void) => {
//                 callback(null);
//             });
//             service.cleanUp();
//             expect(webSocketServiceSpy.emit).toHaveBeenCalledWith('delete-lobby', service.lobbyData.id, jasmine.any(Function));
//             expect(webSocketServiceSpy.disconnect).toHaveBeenCalled();
//             expect(routerSpy.navigate).toHaveBeenCalledWith(['/']);
//         });
//     });

//     it('should emit a start game event', () => {
//         webSocketServiceSpy.emit.and.callFake((event, data, callback: (lobbyData: unknown) => void) => {
//             callback(lobbyData as LobbyData);
//         });
//         service.createLobby(quizData).subscribe(() => {
//             webSocketServiceSpy.emit.and.callFake(() => {
//                 return;
//             });
//             service.startGame(0);
//             expect(webSocketServiceSpy.emit).toHaveBeenCalledWith('start-game', { lobbyId: service.lobbyData.id, countdown: 0 });
//         });
//     });

//     it('should listen to the start game event', (done) => {
//         webSocketServiceSpy.onEvent.and.callFake((event, action) => {
//             const startGameAction = action as () => void;
//             startGameAction();
//         });
//         webSocketServiceSpy.emit.and.callFake((event, data, callback: (lobbyData: unknown) => void) => {
//             callback(lobbyData as LobbyData);
//         });
//         service.createLobby(quizData).subscribe(() => {
//             service.handleSockets();
//             webSocketServiceSpy.onEvent.calls.mostRecent().args[1](null);
//             expect(service.lobbyData.locked).toBeTrue();
//             done();
//         });
//     });
// });
