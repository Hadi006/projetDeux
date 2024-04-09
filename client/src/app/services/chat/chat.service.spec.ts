import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { ChatSocketService } from '@app/services/chat-socket/chat-socket.service';
import { ChatMessage } from '@common/chat-message';
import { TEST_PLAYERS } from '@common/constant';
import { PlayerLeftEventData } from '@common/player-left-event-data';
import { ReplaySubject, Subject } from 'rxjs';
import { PlayerService } from '@app/services/player/player.service';
import { ChatService } from './chat.service';

describe('ChatService', () => {
    let service: ChatService;
    let chatSocketService: jasmine.SpyObj<ChatSocketService>;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let eventSubject: ReplaySubject<NavigationEnd>;
    const messageReceivedSubject: Subject<ChatMessage> = new Subject();
    const playerLeftSubject: Subject<PlayerLeftEventData> = new Subject();
    const playerMutedSubject: Subject<ChatMessage> = new Subject();

    beforeEach(() => {
        chatSocketService = jasmine.createSpyObj('ChatSocketService', [
            'connect',
            'disconnect',
            'isConnected',
            'onMessageReceived',
            'onPlayerLeft',
            'onPlayerMuted',
            'emitNewMessage',
        ]);
        chatSocketService.onMessageReceived.and.returnValue(messageReceivedSubject);
        chatSocketService.onPlayerLeft.and.returnValue(playerLeftSubject);
        chatSocketService.onPlayerMuted.and.returnValue(playerMutedSubject);

        playerServiceSpy = {} as jasmine.SpyObj<PlayerService>;

        eventSubject = new ReplaySubject();
        routerSpy = {} as jasmine.SpyObj<Router>;
        Object.defineProperty(routerSpy, 'events', {
            get: () => {
                return eventSubject;
            },
            configurable: true,
        });
    });

    beforeEach(() => {
        TestBed.configureTestingModule({
            providers: [
                { provide: ChatSocketService, useValue: chatSocketService },
                { provide: Router, useValue: routerSpy },
                { provide: PlayerService, useValue: playerServiceSpy },
            ],
        });

        service = TestBed.inject(ChatService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it("should verify if the route uses sockets and clean up if it doesn't", () => {
        Object.defineProperty(routerSpy, 'routerState', {
            get: () => ({
                snapshot: { root: { firstChild: { data: { usesSockets: false } } } },
            }),
        });
        spyOn(service, 'cleanUp');
        eventSubject.next(new NavigationEnd(1, 'url', 'url'));
        expect(service.cleanUp).toHaveBeenCalled();
    });

    it('should connect the socket if it isnt connected', () => {
        chatSocketService.isConnected.and.returnValue(false);
        service.handleSockets();
        expect(chatSocketService.connect).toHaveBeenCalled();
    });

    it('should add message to messages when message is received', () => {
        service.handleSockets();
        const expectedMessage: ChatMessage = {
            text: 'test',
            timestamp: new Date(),
            author: 'author',
        };
        messageReceivedSubject.next(expectedMessage);
        expect(service.messages).toContain(expectedMessage);
    });

    it('should add system message when player leaves', () => {
        service.handleSockets();
        const expectedData: PlayerLeftEventData = {
            player: TEST_PLAYERS[0],
            players: TEST_PLAYERS,
        };
        playerLeftSubject.next(expectedData);
        expect(service.messages).toContain({
            text: `${TEST_PLAYERS[0].name} a quitté.`,
            timestamp: jasmine.any(Date),
            author: 'Système',
        });
    });

    it('should emit new message', () => {
        const newMessage = 'test';
        service.sendMessage(newMessage);
        expect(chatSocketService.emitNewMessage).toHaveBeenCalledWith(service.pin, {
            text: newMessage,
            timestamp: jasmine.any(Date),
            author: service.participantName,
        });
    });

    it('should not emit new message if player is muted', () => {
        service.participantName = '';
        Object.defineProperty(playerServiceSpy, 'player', {
            get: () => ({ muted: true }),
        });
        service.sendMessage('test');
        expect(chatSocketService.emitNewMessage).not.toHaveBeenCalled();
    });

    it('should not emit new message if message is invalid', () => {
        const newMessage = '';
        service.sendMessage(newMessage);
        expect(chatSocketService.emitNewMessage).not.toHaveBeenCalled();
    });

    it('should clean up', () => {
        service.cleanUp();
        expect(chatSocketService.disconnect).toHaveBeenCalled();
        expect(service.pin).toBe('');
        expect(service.participantName).toBe('');
        expect(service.messages).toEqual([]);
    });
});
