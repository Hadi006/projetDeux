import { Injectable } from '@angular/core';
import { ChatMessage } from '@app/interfaces/chat-message';
import { MAX_MESSAGE_LENGTH } from '@common/constant';
import { Player } from '@common/player';
import { Subject } from 'rxjs';
import { io, Socket } from 'socket.io-client';
@Injectable({
    providedIn: 'root',
})
export class ChatService {
    private url = 'http://localhost:3000';
    private socket: Socket;
    private internalMessages: ChatMessage[] = [];
    private messagesSubject: Subject<void> = new Subject<void>();

    constructor() {
        this.socket = io(this.url);
        this.setupSocket();
    }
    get messages(): ChatMessage[] {
        return this.internalMessages;
    }

    get messagesSubjectGetter(): Subject<void> {
        return this.messagesSubject;
    }

    sendMessage(newMessage: string, player: Player) {
        if (!this.validateMessage(newMessage)) {
            return;
        }

        const newChatMessage: ChatMessage = {
            text: newMessage,
            timestamp: new Date(),
            author: player,
        };

        this.socket.emit('new-message', newChatMessage);
    }
    // private setupSocket() {
    //     this.socket.on('message-received', (message: ChatMessage) => {
    //         this.internalMessages.push(message);
    //         this.messagesSubject.next();
    //     });
    // }
    private setupSocket() {
        this.socket.on('connect', () => {
            // Socket connection is established, now set up other event listeners
            this.socket.on('message-received', (message: ChatMessage) => {
                this.internalMessages.push(message);
                this.messagesSubject.next();
            });
        });
    }

    private validateMessage(message: string): boolean {
        return message.trim() !== '' && message.trim().length <= MAX_MESSAGE_LENGTH;
    }
}
