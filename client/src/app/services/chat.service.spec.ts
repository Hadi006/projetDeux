import { TestBed } from '@angular/core/testing';
import { ChatMessage } from '@common/chat-message';
import { SocketTestHelper } from '@app/test/socket-test-helper';
import { MAX_MESSAGE_LENGTH } from '@common/constant';
import { ChatService } from './chat.service';
import { HostService } from './host.service';
import { PlayerService } from './player.service';
import { WebSocketService } from './web-socket.service';
import { Socket } from 'socket.io-client';

class WebSocketServiceMock extends WebSocketService {
    override connect() {
        return;
    }
}

describe('ChatService', () => {
    let service: ChatService;
    let webSocketServiceMock: WebSocketServiceMock;
    let socketHelper: SocketTestHelper;
    // let playerService: PlayerService;

    beforeEach(() => {
        socketHelper = new SocketTestHelper();
        webSocketServiceMock = new WebSocketServiceMock();
        webSocketServiceMock['socket'] = socketHelper as unknown as Socket;
        const playerServiceSpyObj = jasmine.createSpyObj('PlayerService', ['']);
        const hostServiceSpyObj = jasmine.createSpyObj('HostService', ['']);

        TestBed.configureTestingModule({
            providers: [
                ChatService,
                { provide: WebSocketService, useValue: webSocketServiceMock },
                { provide: PlayerService, useValue: playerServiceSpyObj },
                { provide: HostService, useValue: hostServiceSpyObj },
            ],
        });

        service = TestBed.inject(ChatService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should add a message to the internal messages array', () => {
        const message: ChatMessage = {
            text: 'Test message',
            timestamp: new Date(),
            author: 'TestPlayer',
            roomId: '12345',
        };
        socketHelper.peerSideEmit('message-received', message);
        expect(service.messages.length).toBe(1);
    });

    it('should send a message', () => {
        const message = 'Test message';
        const expectedMessage: ChatMessage = {
            text: message,
            timestamp: jasmine.any(Date) as unknown as Date,
            author: 'TestPlayer',
            roomId: '12345',
        };

        // Stub playerService.pin
        const playerServiceMock = { pin: '12345' };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (service as any)['playerService'] = playerServiceMock;
        service.sendMessage(message);
        expect(webSocketServiceMock.emit).toHaveBeenCalledWith('new-message', expectedMessage);
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

    it('should return the messages subject', () => {
        const mockSubject = jasmine.createSpyObj('Subject', ['next']);
        service['messagesSubject'] = mockSubject;
        expect(service.messagesSubjectGetter).toBe(mockSubject);
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

    it('should emit new-message event with newChatMessage', () => {
        const newChatMessage = 'allo';
        const emitSpy = spyOn(socketHelper, 'emit');

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        service['playerService'] = { pin: '123' } as any;

        service.sendMessage(newChatMessage);

        expect(emitSpy).toHaveBeenCalledWith('new-message', jasmine.any(Object));
    });
});
