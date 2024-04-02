import { Injectable } from '@angular/core';
import { WebSocketService } from '@app/services/web-socket/web-socket.service';
import { ChatMessage } from '@common/chat-message';
import { RoomData } from '@common/room-data';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ChatSocketService {
    private readonly messageReceivedSubject = new Subject<ChatMessage>();

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

    emitNewMessage(pin: string, message: ChatMessage): void {
        this.webSocketService.emit<RoomData<ChatMessage>>('new-message', { pin, data: message });
    }
}
