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
        if (!this.validateMessage(newMessage)) {
            return;
        }

        const newChatMessage: ChatMessage = {
            text: newMessage,
            timestamp: new Date(),
        };
        this.messages.push(newChatMessage);
    }

    private validateMessage(message: string): boolean {
        return message.trim() !== '' && message.trim().length <= MAX_MESSAGE_LENGTH;
    }
}
