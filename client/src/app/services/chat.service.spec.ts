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

    // it('should establish socket connection upon creation', () => {
    //     expect(service['socket']).toBeDefined(); // 'socket' is a private property, hence accessing it via ['socket']
    // });

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
        const chatService = TestBed.inject(ChatService);

        expect(chatService['validateMessage']('')).toBe(false);
        expect(chatService['validateMessage']('   ')).toBe(false);
        expect(chatService['validateMessage']('valid message')).toBe(true);
        expect(chatService['validateMessage']('a'.repeat(MAX_MESSAGE_LENGTH + 1))).toBe(false);
    });

    // it('should update internalMessages and notify subscribers when message is received', fakeAsync(() => {
    //     const player: Player = { name: 'John Doe', score: 0, questions: [], fastestResponseCount: 0 };
    //     const message: ChatMessage = {
    //         text: 'Test message',
    //         timestamp: new Date(),
    //         author: player,

    //     };

    //     const messagesSubjectSpy = spyOn(service.messagesSubjectGetter, 'next').and.callThrough();

    //     service['setupSocket']();
    //     service['socket'].emit('message-received', message);
    //     tick();
    //     expect(service.messages.length).toBe(1);
    //     expect(service.messages[0]).toEqual(message);
    //     expect(messagesSubjectSpy).toHaveBeenCalled();
    // }));

    it('should send valid messages through the socket', () => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        spyOn((service as any).socket, 'emit');
        const newMessage = 'New valid message';
        service.sendMessage(newMessage);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        expect((service as any).socket.emit).toHaveBeenCalledWith('new-message', jasmine.any(Object));
    });
});
