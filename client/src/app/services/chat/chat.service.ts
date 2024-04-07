import { Injectable } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { ChatSocketService } from '@app/services/chat-socket/chat-socket.service';
import { ChatMessage } from '@common/chat-message';
import { MAX_MESSAGE_LENGTH } from '@common/constant';
import { PlayerLeftEventData } from '@common/player-left-event-data';
import { Subscription } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ChatService {
    pin: string;
    participantName: string;
    muted = false;

    private socketSubscription: Subscription;

    private internalMessages: ChatMessage[];

    constructor(
        private chatSocketService: ChatSocketService,
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
        if (!this.chatSocketService.isConnected()) {
            this.chatSocketService.connect();
        }

        this.socketSubscription.add(this.subscribeToMessageReceived());
        this.socketSubscription.add(this.subscribeToPlayerMuted());
        this.socketSubscription.add(this.subscribeToPlayerLeft());
    }

    sendMessage(newMessage: string) {
        if (!this.validateMessage(newMessage)) {
            return;
        }
        console.log(this.muted);
        if (this.muted) {
            return;
        }

        const newChatMessage: ChatMessage = {
            text: newMessage,
            timestamp: new Date(),
            author: this.participantName,
        };

        this.chatSocketService.emitNewMessage(this.pin, newChatMessage);
    }

    cleanUp() {
        this.chatSocketService.disconnect();
        this.socketSubscription.unsubscribe();
        this.reset();
    }

    private reset() {
        this.socketSubscription = new Subscription();
        this.pin = '';
        this.participantName = '';
        this.internalMessages = [];
        this.muted = false;
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

    private subscribeToMessageReceived(): Subscription {
        return this.chatSocketService.onMessageReceived().subscribe((message: ChatMessage) => {
            this.internalMessages.push(message);
        });
    }

    private subscribeToPlayerMuted(): Subscription {
        return this.chatSocketService.onPlayerMuted().subscribe((message: ChatMessage) => {
            this.internalMessages.push(message);
            this.muted = message.text === 'Vous avez été muté';
        })
    }

    private subscribeToPlayerLeft(): Subscription {
        return this.chatSocketService.onPlayerLeft().subscribe((data: PlayerLeftEventData) => {
            this.internalMessages.push({
                text: `${data.player.name} a quitté.`,
                timestamp: new Date(),
                author: 'Système',
            });
        });
    }
}
