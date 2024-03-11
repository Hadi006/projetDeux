import { TestBed } from '@angular/core/testing';
import { MAX_MESSAGE_LENGTH } from '@common/constant';
import { SocketIoConfig, SocketIoModule } from 'ngx-socket-io';
import { ChatService } from './chat.service';

describe('ChatService', () => {
    let service: ChatService;
    const config: SocketIoConfig = { url: 'http://localhost:3000', options: {} };

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [SocketIoModule.forRoot(config)],
            providers: [ChatService],
        });
        service = TestBed.inject(ChatService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should establish socket connection upon creation', () => {
        expect(service['socket']).toBeDefined(); // 'socket' is a private property, hence accessing it via ['socket']
    });

    it('should do nothing when sendMessage is called with an empty string', () => {
        service.sendMessage('');
        expect(service.messages.length).toBe(0);
    });
    it('should do nothing when sendMessage is called with a string longer than 200 characters', () => {
        service.sendMessage('a'.repeat(MAX_MESSAGE_LENGTH + 1));
        expect(service.messages.length).toBe(0);
    });

    it('should do nothing when sendMessage is called with a string that is only whitespace', () => {
        service.sendMessage('   ');
        expect(service.messages.length).toBe(0);
    });

    it('should validate message correctly', () => {
        // Arrange
        const chatService = TestBed.inject(ChatService);

        // Act & Assert
        expect(chatService['validateMessage']('')).toBe(false); // Empty message should return false
        expect(chatService['validateMessage']('   ')).toBe(false); // Only whitespace message should return false
        expect(chatService['validateMessage']('valid message')).toBe(true); // Valid message should return true
        expect(chatService['validateMessage']('a'.repeat(MAX_MESSAGE_LENGTH + 1))).toBe(false); // Message exceeding max length should return false
    });

    // it('should add received message to internal messages', (done) => {
    //     const testMessage = { text: 'Test Message', timestamp: new Date() };
    //     service.messagesSubjectGetter.subscribe(() => {
    //         expect(service.messages.length).toBe(1);
    //         expect(service.messages[0]).toEqual(testMessage);
    //         done();
    //     });
    //     (service as any).socket.emit('message-received', testMessage);
    // });

    it('should send valid messages through the socket', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn((service as any).socket, 'emit');
        const newMessage = 'New valid message';
        service.sendMessage(newMessage);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((service as any).socket.emit).toHaveBeenCalledWith('new-message', jasmine.any(Object));
    });
});
