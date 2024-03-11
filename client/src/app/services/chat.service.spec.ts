import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MAX_MESSAGE_LENGTH } from '@common/constant';
import { io, Socket } from 'socket.io-client';
import { ChatService } from './chat.service';

describe('ChatService', () => {
    let service: ChatService;
    let socket: Socket;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ChatService);
        socket = io();
    });

    afterEach(() => {
        socket.disconnect(); // Disconnect the mock socket after each test
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

    it('should add a message to the messages array when sendMessage is called with a valid message', () => {
        // Arrange
        const service = TestBed.inject(ChatService);
        const initialMessagesLength = service.messages.length; // Get the initial length of messages array

        // Act
        service.sendMessage('test message');

        // Assert
        const updatedMessagesLength = service.messages.length; // Get the updated length of messages array
        expect(updatedMessagesLength).toBe(initialMessagesLength + 1); // Expect the length to increase by 1
        // expect(service.messages[updatedMessagesLength - 1]).toBe('test message'); // Expect the last message to be 'test message'
    });

    it('should add received message to messages array', fakeAsync(() => {
        const message = { text: 'Received message', timestamp: new Date() };
        socket.emit('message-received', message); // Simulate receiving a message from the server
        tick(); // Advance the fakeAsync clock to trigger asynchronous operation
        expect(service.messages.length).toBe(1);
        expect(service.messages[0]).toEqual(message);
    }));

    it('should emit messagesSubject after sending a message', fakeAsync(() => {
        let subjectEmitted = false;
        service.messagesSubjectGetter.subscribe(() => {
            subjectEmitted = true;
        });

        service.sendMessage('New message');
        tick(); // Advance the fakeAsync clock to trigger asynchronous operation
        expect(subjectEmitted).toBe(true);
    }));

    it('should validate message correctly', () => {
        // Arrange
        const chatService = TestBed.inject(ChatService);

        // Act & Assert
        expect(chatService['validateMessage']('')).toBe(false); // Empty message should return false
        expect(chatService['validateMessage']('   ')).toBe(false); // Only whitespace message should return false
        expect(chatService['validateMessage']('valid message')).toBe(true); // Valid message should return true
        expect(chatService['validateMessage']('a'.repeat(MAX_MESSAGE_LENGTH + 1))).toBe(false); // Message exceeding max length should return false
    });

    it('should handle unsuccessful message sending', () => {
        // To test unsuccessful message sending, you may mock the socket.emit method to throw an error
        spyOn(socket, 'emit').and.throwError('Socket error');
        service.sendMessage('Test message');
        expect(socket.emit).toHaveBeenCalled();
        expect(service.messages.length).toBe(0);
    });
});
