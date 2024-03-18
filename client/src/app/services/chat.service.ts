import { Injectable } from '@angular/core';
import { ChatMessage } from '@app/interfaces/chat-message';
import { Player } from '@common/player';
import { Subject } from 'rxjs';
import { PlayerService } from './player.service';
import { WebSocketService } from './web-socket.service';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    private internalMessages: ChatMessage[] = [];
    private messagesSubject: Subject<void> = new Subject<void>();

    constructor(
        private webSocketService: WebSocketService,
        private playerService: PlayerService,
    ) {
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
            roomId: this.playerService.pin,
        };

        this.webSocketService.emit('new-message', newChatMessage);
    }

    private setupSocket() {
        this.webSocketService.onEvent<ChatMessage>('message-received', (message) => {
            this.internalMessages.push(message);
        });
    }

    private validateMessage(message: string): boolean {
        return message.trim() !== '';
    }
}
