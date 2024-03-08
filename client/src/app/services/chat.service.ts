import { Injectable } from '@angular/core';
import { ChatMessage } from '@app/interfaces/chat-message';
import { MAX_MESSAGE_LENGTH } from '@common/constant';
import { io, Socket } from 'socket.io-client';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    private url = 'http://localhost:3000';
    private socket: Socket;
    private internalMessages: ChatMessage[] = [];

    constructor() {
        this.socket = io(this.url);
        this.setupSocket();
    }

    private setupSocket() {
        this.socket.on('message-received', (message: ChatMessage) => {
            this.internalMessages.push(message);
            // Manually trigger change detection
            // (assuming ChatboxComponent's method is called handleMessagesUpdate)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (window as any)['chatboxComponent'].handleMessagesUpdate();
        });
    }

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

        // Emit the message to the server
        this.socket.emit('new-message', newChatMessage);
    }

    private validateMessage(message: string): boolean {
        return message.trim() !== '' && message.trim().length <= MAX_MESSAGE_LENGTH;
    }
}
