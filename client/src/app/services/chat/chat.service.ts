import { Injectable } from '@angular/core';
import { ChatMessage } from '@common/chat-message';
import { MAX_MESSAGE_LENGTH } from '@common/constant';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { RoomData } from '@common/room-data';
import { NavigationEnd, Router } from '@angular/router';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    pin: string;
    participantName: string;

    private internalMessages: ChatMessage[];

    constructor(
        private webSocketService: WebSocketService,
        private router: Router,
    ) {
        this.router.events.subscribe((event) => {
            if (event instanceof NavigationEnd) {
                this.verifyUsesSockets();
            }
        });

        this.reset();
    }

    get messages(): ChatMessage[] {
        return this.internalMessages;
    }

    handleSockets() {
        if (!this.webSocketService.isSocketAlive()) {
            this.webSocketService.connect();
        }

        this.webSocketService.onEvent<ChatMessage>('message-received', (message) => {
            this.internalMessages.push(message);
        });
    }

    sendMessage(newMessage: string) {
        if (!this.validateMessage(newMessage)) {
            return;
        }

        const newChatMessage: ChatMessage = {
            text: newMessage,
            timestamp: new Date(),
            author: this.participantName,
        };

        this.webSocketService.emit<RoomData<ChatMessage>>('new-message', { pin: this.pin, data: newChatMessage });
    }

    cleanUp() {
        this.webSocketService.disconnect();
        this.reset();
    }

    private reset() {
        this.pin = '';
        this.participantName = '';
        this.internalMessages = [];
    }

    private verifyUsesSockets() {
        let currentRoute = this.router.routerState.snapshot.root;

        while (currentRoute.firstChild) {
            currentRoute = currentRoute.firstChild;
        }

        if (!currentRoute.data.usesSockets) {
            this.cleanUp();
        }
    }

    private validateMessage(message: string): boolean {
        return message.trim() !== '' && message.trim().length <= MAX_MESSAGE_LENGTH;
    }
}
