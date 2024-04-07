import { Injectable } from '@angular/core';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { ChatMessage } from '@common/chat-message';
import { PlayerLeftEventData } from '@common/player-left-event-data';
import { RoomData } from '@common/room-data';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ChatSocketService {
    private readonly messageReceivedSubject = new Subject<ChatMessage>();
    private readonly playerLeftSubject = new Subject<PlayerLeftEventData>();

    constructor(private webSocketService: WebSocketService) {}

    connect(): void {
        this.webSocketService.connect();
    }

    disconnect(): void {
        this.webSocketService.disconnect();
    }

    isConnected(): boolean {
        return this.webSocketService.isSocketAlive();
    }

    onMessageReceived(): Subject<ChatMessage> {
        this.webSocketService.onEvent<ChatMessage>('message-received', (message) => {
            this.messageReceivedSubject.next(message);
        });

        return this.messageReceivedSubject;
    }

    onPlayerMuted(): Subject<ChatMessage> {
        this.webSocketService.onEvent<ChatMessage>('player-muted', (message) => {
            this.messageReceivedSubject.next(message);
        });

        return this.messageReceivedSubject;
    }

    onPlayerLeft(): Subject<PlayerLeftEventData> {
        this.webSocketService.onEvent<PlayerLeftEventData>('player-left', (data) => {
            this.playerLeftSubject.next(data);
        });

        return this.playerLeftSubject;
    }

    emitNewMessage(pin: string, message: ChatMessage): void {
        this.webSocketService.emit<RoomData<ChatMessage>>('new-message', { pin, data: message });
    }
}
