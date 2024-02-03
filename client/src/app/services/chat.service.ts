import { Injectable } from '@angular/core';
import { ChatMessage } from '@app/interfaces/chat-message';

export const MAX_MESSAGE_LENGTH = 200;

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    private internalMessages: ChatMessage[] = [];

    get messages(): ChatMessage[] {
        return this.internalMessages;
    }
}
