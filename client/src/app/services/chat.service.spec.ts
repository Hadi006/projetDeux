import { TestBed } from '@angular/core/testing';

import { ChatService, MAX_MESSAGE_LENGTH } from './chat.service';

describe('ChatService', () => {
    let service: ChatService;

    beforeEach(() => {
        TestBed.configureTestingModule({});
        service = TestBed.inject(ChatService);
    });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should do nothing when sendMessage is called with an empty string', () => {
        service.sendMessage('');
        expect(service.messages.length).toBe(0);
    });

    it('should do nothing when sendMessage is called with a string longer than 200 characters', () => {
        service.sendMessage('a'.repeat(MAX_MESSAGE_LENGTH + 1));
        expect(service.messages.length).toBe(0);
    });
});
