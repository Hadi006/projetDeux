import { TestBed } from '@angular/core/testing';
import { SocketTestHelper } from '@app/test/socket-test-helper';
import { ChatMessage } from '@common/chat-message';
import { MAX_MESSAGE_LENGTH, TEST_GAME_DATA } from '@common/constant';
import { Game } from '@common/game';
import { Socket } from 'socket.io-client';
import { HostService } from '@app/services/host/host.service';
import { PlayerService } from '@app/services/player/player.service';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { ChatService } from './chat.service';

class WebSocketServiceMock extends WebSocketService {
    override connect() {
        return;
    }
}

describe('ChatService', () => {
    let service: ChatService;
    let webSocketServiceMock: WebSocketServiceMock;
    let socketHelper: SocketTestHelper;
    let playerServiceSpy: jasmine.SpyObj<PlayerService>;
    let hostServiceSpy: jasmine.SpyObj<HostService>;

    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        webSocketServiceMock = new WebSocketServiceMock();
        webSocketServiceMock['socket'] = socketHelper as unknown as Socket;
        playerServiceSpy = jasmine.createSpyObj('PlayerService', ['']);
        Object.defineProperty(playerServiceSpy, 'pin', { get: () => '12345', configurable: true });
        Object.defineProperty(playerServiceSpy, 'player', {
            get: () => {
                return { name: 'TestPlayer' };
            },
            configurable: true,
        });
        hostServiceSpy = jasmine.createSpyObj('HostService', ['']);
        Object.defineProperty(hostServiceSpy, 'game', { get: () => TEST_GAME_DATA, configurable: true });

        TestBed.configureTestingModule({
            providers: [
                ChatService,
                { provide: WebSocketService, useValue: webSocketServiceMock },
                { provide: PlayerService, useValue: playerServiceSpy },
                { provide: HostService, useValue: hostServiceSpy },
            ],
        });

        service = TestBed.inject(ChatService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should send a message as Player', () => {
        const message = 'Test message';
        const expectedMessage: ChatMessage = {
            text: message,
            timestamp: jasmine.any(Date) as unknown as Date,
            author: 'TestPlayer',
            roomId: '12345',
        };
        const emitSpy = spyOn(webSocketServiceMock, 'emit');
        spyOnProperty(hostServiceSpy, 'game', 'get').and.returnValue(undefined as unknown as Game);
        service.init();

        service.sendMessage(message);

        expect(emitSpy).toHaveBeenCalledWith('new-message', expectedMessage);
    });

    it('should send a message as a host', () => {
        const message = 'Test message';
        const expectedMessage: ChatMessage = {
            text: message,
            timestamp: jasmine.any(Date) as unknown as Date,
            author: 'TestPlayer',
            roomId: TEST_GAME_DATA.pin,
        };
        const emitSpy = spyOn(webSocketServiceMock, 'emit');
        spyOnProperty(playerServiceSpy, 'pin', 'get').and.returnValue(undefined as unknown as string);
        service.init();
        service.sendMessage(message);
        expect(emitSpy).toHaveBeenCalledWith('new-message', expectedMessage);
    });

    it('should add message to internalMessages when message-received event is received', () => {
        const message: ChatMessage = {
            text: 'Test message',
            timestamp: new Date(),
            author: 'TestPlayer',
            roomId: '12345',
        };
        service.init();
        socketHelper.on('message-received', (receivedMessage: ChatMessage) => {
            expect(receivedMessage).toEqual(message);
            expect(service['internalMessages']).toContain(receivedMessage);
            return {};
        });
        socketHelper.peerSideEmit('message-received', message);
    });

    it('should return false for an empty message', () => {
        const message = '';
        expect(service['validateMessage'](message)).toBeFalse();
    });

    it('should return the internal messages array', () => {
        const mockMessages = [{ text: 'Message 1', timestamp: new Date(), author: 'Player 1', roomId: '12345' }];
        service['internalMessages'] = mockMessages;
        expect(service.messages).toEqual(mockMessages);
    });

    it('should return true for a non-empty message', () => {
        const message = 'Test message';
        expect(service['validateMessage'](message)).toBeTrue();
    });

    it('should validate message correctly', () => {
        const chatService = TestBed.inject(ChatService);

        expect(chatService['validateMessage']('')).toBe(false);
        expect(chatService['validateMessage']('   ')).toBe(false);
        expect(chatService['validateMessage']('valid message')).toBe(true);
        expect(chatService['validateMessage']('a'.repeat(MAX_MESSAGE_LENGTH + 1))).toBe(false);
    });

    it('should do nothing when sendMessage is called with an empty string', () => {
        service.sendMessage('');
        expect(service.messages.length).toBe(0);
    });
});
