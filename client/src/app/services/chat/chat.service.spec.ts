import { TestBed } from '@angular/core/testing';
import { NavigationEnd, Router } from '@angular/router';
import { ChatSocketService } from '@app/services/chat-socket/chat-socket.service';
import { ChatMessage } from '@common/chat-message';
import { ReplaySubject, Subject } from 'rxjs';
import { ChatService } from './chat.service';

describe('ChatService', () => {
    let service: ChatService;
    let chatSocketService: jasmine.SpyObj<ChatSocketService>;
    let routerSpy: jasmine.SpyObj<Router>;
    let eventSubject: ReplaySubject<NavigationEnd>;
    const messageReceivedSubject: Subject<ChatMessage> = new Subject();

    beforeEach(() => {
        chatSocketService = jasmine.createSpyObj('ChatSocketService', [
            'connect',
            'disconnect',
            'isConnected',
            'onMessageReceived',
            'emitNewMessage',
        ]);
        chatSocketService.onMessageReceived.and.returnValue(messageReceivedSubject);

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
});
