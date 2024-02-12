import { Injectable } from '@angular/core';
import { ChatMessage } from '@app/interfaces/chat-message';
import { MAX_MESSAGE_LENGTH } from '@common/constant';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    private internalMessages: ChatMessage[] = [];

    get messages(): ChatMessage[] {
        return this.internalMessages;
    }

    sendMessage(newMessage: string) {
        const isValidMessage = newMessage.trim() !== '' && newMessage.trim().length <= MAX_MESSAGE_LENGTH;
        if (!isValidMessage) {
            return;
        }

        const newChatMessage: ChatMessage = {
            text: newMessage,
            timestamp: new Date(),
        };
        this.messages.push(newChatMessage);
    }
}
