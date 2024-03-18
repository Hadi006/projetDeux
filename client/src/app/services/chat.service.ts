import { Injectable } from '@angular/core';
import { ChatMessage } from '@app/interfaces/chat-message';
import { Subject } from 'rxjs';
import { HostService } from './host.service';
import { PlayerService } from './player.service';
import { WebSocketService } from './web-socket.service';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    private internalMessages: ChatMessage[] = [];
    private messagesSubject: Subject<void> = new Subject<void>();
    private internalParticipantName: string;

    constructor(
        private webSocketService: WebSocketService,
        private playerService: PlayerService,
        private hostService: HostService,
    ) {
        this.setupSocket();
        this.internalParticipantName = this.playerService.player?.name || 'Organisateur';
    }

    get messages(): ChatMessage[] {
        return this.internalMessages;
    }

    get messagesSubjectGetter(): Subject<void> {
        return this.messagesSubject;
    }

    // eslint-disable-next-line no-dupe-class-members
    get participantName(): string {
        return this.internalParticipantName;
    }

    sendMessage(newMessage: string) {
        if (!this.validateMessage(newMessage)) {
            return;
        }

        const newChatMessage: ChatMessage = {
            text: newMessage,
            timestamp: new Date(),
            // eslint-disable-next-line object-shorthand
            author: this.participantName,
            roomId: this.playerService.pin || this.hostService.game.pin,
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
